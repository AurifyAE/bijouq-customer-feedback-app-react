import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import {
    getStoredToken,
    getStoredAdmin,
    clearSession,
    verifySession,
} from "./services/adminApi";

// ─── Loading Screen ────────────────────────────────────────────────────────
const LoadingScreen = () => (
    <div className="min-h-screen bg-[#f2eee9] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#002e23] flex items-center justify-center">
            <svg
                width={24} height={24} viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
            >
                <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z" />
            </svg>
        </div>
        <div className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4 text-[#002e23]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#002e23" strokeWidth="4" />
                <path className="opacity-75" fill="#002e23" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-sm text-[#6b7280] font-500">Verifying session…</span>
        </div>
    </div>
);

// ─── App Root ──────────────────────────────────────────────────────────────
export default function App() {
    const [token, setToken] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [checking, setChecking] = useState(true);

    // ── On mount: check for a stored token and verify it with the server
    useEffect(() => {
        const storedToken = getStoredToken();
        const storedAdmin = getStoredAdmin();

        if (!storedToken || !storedAdmin) {
            setChecking(false);
            return;
        }

        // Verify token is still valid with /auth/me
        verifySession(storedToken)
            .then((data) => {
                setToken(storedToken);
                setAdmin(data.admin);
            })
            .catch(() => {
                // Token expired or invalid — clear and show login
                clearSession();
            })
            .finally(() => {
                setChecking(false);
            });
    }, []);

    // ── Called by Login on successful sign-in
    const handleLogin = (newToken, newAdmin) => {
        setToken(newToken);
        setAdmin(newAdmin);
    };

    // ── Called by Navbar logout button
    const handleLogout = () => {
        clearSession();
        setToken(null);
        setAdmin(null);
    };

    // ── Show spinner while verifying stored session
    if (checking) return <LoadingScreen />;

    // ── Route: Login or Dashboard
    if (!token || !admin) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <Dashboard
            token={token}
            admin={admin}
            onLogout={handleLogout}
        />
    );
}