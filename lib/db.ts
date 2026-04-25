import postgres from "postgres";

const sql = postgres({
  host: process.env.DB_HOST!,
  port: 5432,
  database: "postgres",
  username: "postgres",
  password: process.env.DB_PASSWORD!,
  ssl: "require",
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Runs once at module load — creates tables if they don't exist yet.
export const schemaReady: Promise<void> = (async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS profiles (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name       TEXT NOT NULL,
      role       TEXT NOT NULL DEFAULT 'student',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS debate_sessions (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      figure_icon   TEXT NOT NULL,
      figure_name   TEXT NOT NULL,
      dilemma       TEXT NOT NULL,
      mode          TEXT NOT NULL,
      message_count INTEGER NOT NULL DEFAULT 0,
      grounded      BOOLEAN NOT NULL DEFAULT FALSE,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS debate_sessions_profile_id_idx
    ON debate_sessions (profile_id)
  `;
})();

export default sql;
