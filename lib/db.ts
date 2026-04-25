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

export default sql;
