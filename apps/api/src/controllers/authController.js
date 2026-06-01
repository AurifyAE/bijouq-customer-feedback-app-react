import bcrypt from "bcryptjs";
import { findAdminByEmail } from "../models/feedbackModel.js";
import { generateToken } from "../utils/jwt.js";

// ─────────────────────────────────────────────
//  POST /api/auth/login
// ─────────────────────────────────────────────

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic input validation
        if (!email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Email and password are required.",
            });
        }

        // Find admin by email
        const admin = await findAdminByEmail(email.trim().toLowerCase());

        if (!admin) {
            return res.status(401).json({
                status: "error",
                message: "Invalid email or password.",
            });
        }

        // Compare password with stored hash
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({
                status: "error",
                message: "Invalid email or password.",
            });
        }

        // Generate JWT
        const token = generateToken({
            id: admin.id,
            email: admin.email,
        });

        return res.status(200).json({
            status: "success",
            message: "Login successful.",
            token,
            admin: {
                id: admin.id,
                email: admin.email,
            },
        });
    } catch (err) {
        console.error("Login error:", err.message);
        return res.status(500).json({
            status: "error",
            message: "Internal server error.",
        });
    }
};

// ─────────────────────────────────────────────
//  GET /api/auth/me  (verify token + return admin info)
// ─────────────────────────────────────────────

const me = async (req, res) => {
    try {
        return res.status(200).json({
            status: "success",
            admin: req.admin,
        });
    } catch (err) {
        console.error("Me error:", err.message);
        return res.status(500).json({
            status: "error",
            message: "Internal server error.",
        });
    }
};

export { login, me };