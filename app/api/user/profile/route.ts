import { NextRequest, NextResponse } from "next/server";
import sql, { ensureSchema } from "@/lib/db";

export async function POST(req: NextRequest) {
  await ensureSchema();
  try {
    const { name, role } = await req.json();
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    const [profile] = await sql`
      INSERT INTO profiles (name, role)
      VALUES (${name.trim()}, ${role ?? "student"})
      RETURNING id, name, role, created_at AS "createdAt"
    `;
    return NextResponse.json(profile, { status: 201 });
  } catch (err) {
    console.error("[POST /api/user/profile]", err);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await ensureSchema();
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const [profile] = await sql`
      SELECT id, name, role, created_at AS "createdAt"
      FROM profiles WHERE id = ${id}
    `;
    if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(profile);
  } catch (err) {
    console.error("[GET /api/user/profile]", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
