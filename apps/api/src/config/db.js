import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl:
                process.env.NODE_ENV === "production"
                    ? { rejectUnauthorized: false }
                    : false,
        }
        : {
            host: process.env.DB_HOST || "localhost",
            port: parseInt(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME || "bijouq_survey",
            user: process.env.DB_USER || "postgres",
            password: process.env.DB_PASSWORD,
            ssl:
                process.env.NODE_ENV === "production"
                    ? { rejectUnauthorized: false }
                    : false,
            // Connection pool settings
            max: 20,                // max number of clients in the pool
            idleTimeoutMillis: 30000,   // close idle clients after 30s
            connectionTimeoutMillis: 2000, // error if connection takes >2s
        }
);

// Test connection on startup
pool.connect((err, client, release) => {
    if (err) {
        console.error("❌ Failed to connect to PostgreSQL:", err.message);
        process.exit(1);
    }
    client.query("SELECT NOW()", (err, result) => {
        release();
        if (err) {
            console.error("❌ PostgreSQL query error:", err.message);
            process.exit(1);
        }
        console.log("✅ PostgreSQL connected at:", result.rows[0].now);
    });
});

// Graceful shutdown
process.on("SIGINT", async () => {
    await pool.end();
    console.log("🔌 PostgreSQL pool closed.");
    process.exit(0);
});

export default pool;