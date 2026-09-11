import { Pool } from "pg";
import bcrypt from "bcrypt";

const pool = new Pool({
  connectionString: process.env.DATABASE_WRITE_URL || "postgresql://postgres:toolera_pass@localhost:5452/toolera_db",
});

async function seed() {
  const client = await pool.connect();
  try {
    const passwordHash = await bcrypt.hash("123456", 12);

    await client.query(`
      INSERT INTO toolera.admin_users (email, password_hash, name, role, status)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ["toolera.app@gmail.com", passwordHash, "Super Admin", "SUPER_ADMIN", "ACTIVE"]);

    console.log("Super admin created: toolera.app@gmail.com / 123456");
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
