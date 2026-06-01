import { verifyToken } from "../utils/jwt.js";

// ─────────────────────────────────────────────
//  Protect Route Middleware
// ─────────────────────────────────────────────

const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check Authorization header exists and is Bearer format
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                status: "error",
                message: "Access denied. No token provided.",
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                status: "error",
                message: "Access denied. Token is malformed.",
            });
        }

        // Verify token — throws on expired or invalid
        const decoded = verifyToken(token);

        // Attach admin payload to request for downstream use
        req.admin = {
            id: decoded.id,
            email: decoded.email,
        };

        next();
    } catch (err) {
        return res.status(401).json({
            status: "error",
            message: err.message || "Unauthorized.",
        });
    }
};

export { protect };