import pool from "../config/db.js";

// ─────────────────────────────────────────────
//  Create Tables (run once on startup)
// ─────────────────────────────────────────────

const createTables = async () => {
    const createAdminsTable = `
    CREATE TABLE IF NOT EXISTS admins (
      id          SERIAL PRIMARY KEY,
      email       VARCHAR(255) UNIQUE NOT NULL,
      password    VARCHAR(255) NOT NULL,
      created_at  TIMESTAMP DEFAULT NOW()
    );
  `;

    const createSurveysTable = `
    CREATE TABLE IF NOT EXISTS surveys (
      id                        SERIAL PRIMARY KEY,
      phone                     VARCHAR(20) NOT NULL,
      country_code              VARCHAR(5),
      country_name              VARCHAR(100),
      full_name                 VARCHAR(255),
      emirates_id               VARCHAR(100),
      date_of_birth             VARCHAR(20),
      hear_about_us             TEXT,
      hear_about_us_other       TEXT,
      jewelry_collections       TEXT,
      jewelry_collections_other TEXT,
      bijouq_branch             VARCHAR(255),
      feedback                  TEXT,
      language                  VARCHAR(5) DEFAULT 'en',
      submitted_at              TIMESTAMP DEFAULT NOW()
    );
  `;

    try {
        await pool.query(createAdminsTable);
        await pool.query(createSurveysTable);
        console.log("✅ Tables ready (admins, surveys)");
    } catch (err) {
        console.error("❌ Error creating tables:", err.message);
        throw err;
    }
};

// ─────────────────────────────────────────────
//  Seed Default Admin (run once on startup)
// ─────────────────────────────────────────────

const seedAdmin = async (hashedPassword) => {
    const email = process.env.ADMIN_EMAIL || "admin@bluediamond.com";

    const existing = await pool.query(
        "SELECT id FROM admins WHERE email = $1",
        [email]
    );

    if (existing.rows.length === 0) {
        await pool.query(
            "INSERT INTO admins (email, password) VALUES ($1, $2)",
            [email, hashedPassword]
        );
        console.log(`✅ Default admin created: ${email}`);
    } else {
        console.log(`ℹ️  Admin already exists: ${email}`);
    }
};

// ─────────────────────────────────────────────
//  Admin Queries
// ─────────────────────────────────────────────

const findAdminByEmail = async (email) => {
    const result = await pool.query(
        "SELECT * FROM admins WHERE email = $1",
        [email]
    );
    return result.rows[0] || null;
};

// ─────────────────────────────────────────────
//  Survey Queries
// ─────────────────────────────────────────────

// Insert a new survey submission
const insertSurvey = async (data) => {
    const {
        phone,
        country_code,
        country_name,
        full_name,
        emirates_id,
        date_of_birth,
        hear_about_us,
        hear_about_us_other,
        jewelry_collections,
        jewelry_collections_other,
        bijouq_branch,
        feedback,
        language,
    } = data;

    const result = await pool.query(
        `INSERT INTO surveys (
        phone, country_code, country_name, full_name, emirates_id,
        date_of_birth, hear_about_us, hear_about_us_other,
        jewelry_collections, jewelry_collections_other,
        bijouq_branch, feedback, language
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10,
        $11, $12, $13
      ) RETURNING *`,
        [
            phone,
            country_code,
            country_name,
            full_name,
            emirates_id || null,
            date_of_birth || null,
            hear_about_us || null,
            hear_about_us_other || null,
            jewelry_collections || null,
            jewelry_collections_other || null,
            bijouq_branch || null,
            feedback || null,
            language || "en",
        ]
    );

    return result.rows[0];
};

// Get all surveys with optional filters + pagination
const getAllSurveys = async ({ page = 1, limit = 20, search = "", country = "", branch = "" } = {}) => {
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let idx = 1;

    if (search) {
        conditions.push(
            `(full_name ILIKE $${idx} OR phone ILIKE $${idx} OR emirates_id ILIKE $${idx})`
        );
        values.push(`%${search}%`);
        idx++;
    }

    if (country) {
        conditions.push(`country_code = $${idx}`);
        values.push(country);
        idx++;
    }

    if (branch) {
        conditions.push(`bijouq_branch ILIKE $${idx}`);
        values.push(`%${branch}%`);
        idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // Total count for pagination
    const countResult = await pool.query(
        `SELECT COUNT(*) FROM surveys ${where}`,
        values
    );
    const total = parseInt(countResult.rows[0].count);

    // Paginated rows
    const dataResult = await pool.query(
        `SELECT * FROM surveys ${where}
     ORDER BY submitted_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, limit, offset]
    );

    return {
        data: dataResult.rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};

// Get a single survey by ID
const getSurveyById = async (id) => {
    const result = await pool.query(
        "SELECT * FROM surveys WHERE id = $1",
        [id]
    );
    return result.rows[0] || null;
};

// Delete a survey by ID
const deleteSurveyById = async (id) => {
    const result = await pool.query(
        "DELETE FROM surveys WHERE id = $1 RETURNING id",
        [id]
    );
    return result.rows[0] || null;
};

// Get summary stats for dashboard
const getSurveyStats = async () => {
    const result = await pool.query(`
    SELECT
      COUNT(*)                                              AS total,
      COUNT(*) FILTER (WHERE language = 'en')              AS english,
      COUNT(*) FILTER (WHERE language = 'ar')              AS arabic,
      COUNT(*) FILTER (WHERE submitted_at >= NOW() - INTERVAL '7 days')  AS last_7_days,
      COUNT(*) FILTER (WHERE submitted_at >= NOW() - INTERVAL '30 days') AS last_30_days
    FROM surveys
  `);

    const byCountry = await pool.query(`
    SELECT country_name, country_code, COUNT(*) AS count
    FROM surveys
    GROUP BY country_name, country_code
    ORDER BY count DESC
  `);

    const byBranch = await pool.query(`
    SELECT bijouq_branch AS branch, COUNT(*) AS count
    FROM surveys
    WHERE bijouq_branch IS NOT NULL
    GROUP BY bijouq_branch
    ORDER BY count DESC
  `);

    return {
        summary: result.rows[0],
        byCountry: byCountry.rows,
        byBranch: byBranch.rows,
    };
};

export {
    createTables,
    seedAdmin,
    findAdminByEmail,
    insertSurvey,
    getAllSurveys,
    getSurveyById,
    deleteSurveyById,
    getSurveyStats,
};