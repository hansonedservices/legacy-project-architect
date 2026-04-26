import { NextRequest, NextResponse } from "next/server";
import sql, { ensureSchema } from "../../../../lib/db";

export async function GET(req: NextRequest) {
  await ensureSchema();
  try {
    const profileId = req.nextUrl.searchParams.get("profileId");
    if (!profileId) return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
    const rows = await sql`
      SELECT
        id,
        figure_icon  AS "figureIcon",
        figure_name  AS "figureName",
        dilemma,
        mode,
        message_count AS "messageCount",
        grounded,
        created_at   AS "date"
      FROM debate_sessions
      WHERE profile_id = ${profileId}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return NextResponse.json(rows);
  } catch (err) {
    console.error("[GET /api/user/history]", err);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  try {
    const { profileId, figureIcon, figureName, dilemma, mode, messageCount, grounded } =
      await req.json();
    if (!profileId || !figureName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const [row] = await sql`
      INSERT INTO debate_sessions
        (profile_id, figure_icon, figure_name, dilemma, mode, message_count, grounded)
      VALUES
        (${profileId}, ${figureIcon}, ${figureName}, ${dilemma}, ${mode}, ${messageCount ?? 0}, ${grounded ?? false})
      RETURNING id, created_at AS "date"
    `;
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error("[POST /api/user/history]", err);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}
