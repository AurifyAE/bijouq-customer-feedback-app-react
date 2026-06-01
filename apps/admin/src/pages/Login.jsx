import { useState } from "react";
import { login, saveSession } from "../services/adminApi";

// ─── Icons ────────────────────────────────────────────────────────────────
const MailIcon = () => (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const LockIcon = () => (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const EyeIcon = () => (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const DiamondIcon = () => (
    <svg width={26} height={26} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z" />
    </svg>
);

export default function Login({ onLogin }) {
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            setError("Please enter your email and password.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const data = await login(form.email.trim().toLowerCase(), form.password);
            saveSession(data.token, data.admin);
            onLogin(data.token, data.admin);
        } catch (err) {
            setError(err.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#f2eee9]">

            {/* ── Left panel — branding ───────────────────────────────────────── */}
            <div className="hidden lg:flex flex-col justify-between w-[42%] bg-[#002e23] p-12 relative overflow-hidden">

                {/* Decorative circles */}
                <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full border border-white/5" />
                <div className="absolute -top-12 -left-12 w-56 h-56 rounded-full border border-white/5" />
                <div className="absolute bottom-32 -right-20 w-64 h-64 rounded-full border border-white/5" />
                <div className="absolute bottom-16 right-8 w-32 h-32 rounded-full bg-white/[0.03] border border-white/5" />

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />

                {/* Top — Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                            <DiamondIcon />
                        </div>
                        <span
                            className="text-white text-xl font-800 tracking-tight"
                            style={{ fontFamily: "'DM Serif Display', serif" }}
                        >
                            Bijouq
                        </span>
                    </div>
                </div>

                {/* Middle — Headline */}
                <div className="relative z-10">
                    <h1
                        className="text-white text-4xl xl:text-5xl font-800 leading-tight mb-6"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                        Survey
                        <br />
                        <span className="text-[#f2eee9]/70">Management</span>
                        <br />
                        Portal
                    </h1>
                    <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                        Access and manage all customer survey submissions, track insights,
                        and export data — all in one place.
                    </p>
                </div>

                {/* Bottom — Stats teaser */}
                <div className="relative z-10 flex gap-6">
                    {[
                        { label: "Submissions", value: "Live" },
                        { label: "Languages", value: "EN · AR" },
                        { label: "Regions", value: "6 Countries" },
                    ].map((item) => (
                        <div key={item.label}>
                            <div className="text-white text-sm font-700">{item.value}</div>
                            <div className="text-white/40 text-xs mt-0.5">{item.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Right panel — login form ─────────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">

                    {/* Mobile logo */}
                    <div className="flex items-center gap-3 mb-10 lg:hidden">
                        <div className="w-9 h-9 rounded-xl bg-[#002e23] flex items-center justify-center text-white">
                            <DiamondIcon />
                        </div>
                        <span
                            className="text-[#002e23] text-xl font-800"
                            style={{ fontFamily: "'DM Serif Display', serif" }}
                        >
                            Bijouq
                        </span>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h2
                            className="text-3xl font-800 text-[#002e23] mb-2 tracking-tight"
                            style={{ fontFamily: "'DM Serif Display', serif" }}
                        >
                            Welcome back
                        </h2>
                        <p className="text-sm text-[#6b7280]">
                            Sign in to your admin account to continue.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-700 uppercase tracking-widest text-[#6b7280] mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                                    <MailIcon />
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="admin@bijouq.com"
                                    autoComplete="email"
                                    autoFocus
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#e8e2db] bg-white text-sm text-[#1a1a1a] placeholder-[#c4bcb5] outline-none focus:border-[#002e23] transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-700 uppercase tracking-widest text-[#6b7280] mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                                    <LockIcon />
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl border-2 border-[#e8e2db] bg-white text-sm text-[#1a1a1a] placeholder-[#c4bcb5] outline-none focus:border-[#002e23] transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#002e23] transition-colors"
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
                                <span className="mt-0.5 flex-shrink-0">⚠</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-2xl bg-[#002e23] text-white text-sm font-700 tracking-wide hover:bg-[#1b4332] active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#002e23]/20 mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                    </svg>
                                    Signing in…
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Footer note */}
                    <p className="text-center text-xs text-[#9ca3af] mt-8">
                        Bijouq Admin Portal · Access restricted to authorized users only
                    </p>
                </div>
            </div>
        </div>
    );
}