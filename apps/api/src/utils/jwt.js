import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

// ─────────────────────────────────────────────
//  Generate Token
// ─────────────────────────────────────────────

const generateToken = (payload) => {
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

// ─────────────────────────────────────────────
//  Verify Token
// ─────────────────────────────────────────────

const verifyToken = (token) => {
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            throw new Error("Token has expired. Please log in again.");
        }
        if (err.name === "JsonWebTokenError") {
            throw new Error("Invalid token. Please log in again.");
        }
        throw new Error("Token verification failed.");
    }
};

// ─────────────────────────────────────────────
//  Decode Token (without verification)
// ─────────────────────────────────────────────

const decodeToken = (token) => {
    return jwt.decode(token);
};

export {
    generateToken,
    verifyToken,
    decodeToken,
};