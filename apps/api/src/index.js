import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";

import { createTables, seedAdmin } from "./models/feedbackModel.js";
import authRoutes from "./routes/authRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────
//  Security Middleware
// ─────────────────────────────────────────────

app.use(helmet());

// CORS — allow frontend origins defined in .env
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, Postman)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            callback(new Error(`CORS: Origin ${origin} not allowed`));
        },
        methods: ["GET", "POST", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

// ─────────────────────────────────────────────
//  Rate Limiting
// ─────────────────────────────────────────────

// Strict limit on login to prevent brute force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
        status: "error",
        message: "Too many login attempts. Please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// General API limit
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        status: "error",
        message: "Too many requests. Please slow down.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api", apiLimiter);

// ─────────────────────────────────────────────
//  Body Parsing
// ─────────────────────────────────────────────

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─────────────────────────────────────────────
//  Health Check
// ─────────────────────────────────────────────

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Bijouq Survey API is running.",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
    });
});

// ─────────────────────────────────────────────
//  Routes
// ─────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);

// ─────────────────────────────────────────────
//  404 Handler
// ─────────────────────────────────────────────

app.use((req, res) => {
    res.status(404).json({
        status: "error",
        message: `Route ${req.method} ${req.originalUrl} not found.`,
    });
});

// ─────────────────────────────────────────────
//  Global Error Handler
// ─────────────────────────────────────────────

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.message);
    res.status(err.status || 500).json({
        status: "error",
        message:
            process.env.NODE_ENV === "production"
                ? "Internal server error."
                : err.message,
    });
});

// ─────────────────────────────────────────────
//  Startup: create tables + seed admin + listen
// ─────────────────────────────────────────────

const start = async () => {
    try {
        // Ensure tables exist
        await createTables();

        // Seed default admin from .env credentials
        const rawPassword = process.env.ADMIN_PASSWORD || "admin@123";
        const hashedPassword = await bcrypt.hash(rawPassword, 12);
        await seedAdmin(hashedPassword);

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📋 Environment: ${process.env.NODE_ENV || "development"}`);
            console.log(`🔑 Admin email: ${process.env.ADMIN_EMAIL}`);
        });
    } catch (err) {
        console.error("❌ Startup failed:", err.message);
        process.exit(1);
    }
};

start();