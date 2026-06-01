import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import StatCards from "../components/StatCards";
import DataTable from "../components/DataTable";
import { fetchSurveys, fetchStats } from "../services/adminApi";

// ─── Mini breakdown panels ─────────────────────────────────────────────────
const BreakdownPanel = ({ title, icon, items, valueKey, labelKey, accentColor }) => (
    <div className="bg-white rounded-2xl border border-[#f2eee9] p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
            <span className="text-[#002e23]">{icon}</span>
            <h3 className="text-xs font-700 uppercase tracking-widest text-[#6b7280]">{title}</h3>
        </div>
        {!items || items.length === 0 ? (
            <p className="text-xs text-[#9ca3af]">No data yet</p>
        ) : (
            <div className="space-y-2.5">
                {items.slice(0, 6).map((item, i) => {
                    const total = items.reduce((s, it) => s + parseInt(it[valueKey]), 0);
                    const pct = total > 0 ? Math.round((parseInt(item[valueKey]) / total) * 100) : 0;
                    return (
                        <div key={i}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-[#374151] font-500 truncate max-w-[70%]">
                                    {item[labelKey] || "Unknown"}
                                </span>
                                <span className="text-xs font-700 text-[#002e23]">{item[valueKey]}</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-[#f2eee9] overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%`, background: accentColor }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
);

const GlobeIcon = () => (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

const BranchIcon = () => (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

// ─── Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard({ token, admin, onLogout }) {
    const [surveys, setSurveys] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [country, setCountry] = useState("");
    const [branch, setBranch] = useState("");

    const LIMIT = 20;

    // ── Fetch stats
    const loadStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const data = await fetchStats(token);
            setStats(data.data);
        } catch (err) {
            console.error("Failed to fetch stats:", err.message);
        } finally {
            setStatsLoading(false);
        }
    }, [token]);

    // ── Fetch surveys
    const loadSurveys = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchSurveys(token, { page, limit: LIMIT, search, country, branch });
            setSurveys(data.data);
            setTotalPages(data.totalPages);
            setTotal(data.total);
        } catch (err) {
            console.error("Failed to fetch surveys:", err.message);
        } finally {
            setLoading(false);
        }
    }, [token, page, search, country, branch]);

    // Fetch both on mount
    useEffect(() => { loadStats(); }, [loadStats]);
    useEffect(() => { loadSurveys(); }, [loadSurveys]);

    // Refresh both after a delete
    const handleRefresh = () => {
        loadSurveys();
        loadStats();
    };

    return (
        <div className="min-h-screen bg-[#f2eee9]">

            {/* Navbar */}
            <Navbar admin={admin} onLogout={onLogout} />

            {/* Page content */}
            <main className="max-w-[1440px] mx-auto px-6 py-8">

                {/* ── Page header ──────────────────────────────────────────────── */}
                <div className="mb-8">
                    <h1
                        className="text-2xl font-800 text-[#002e23] tracking-tight"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                        Survey Dashboard
                    </h1>
                    <p className="text-sm text-[#6b7280] mt-1">
                        {statsLoading
                            ? "Loading summary…"
                            : `${stats?.summary?.total ?? 0} total submissions across ${stats?.byCountry?.length ?? 0} countries`}
                    </p>
                </div>

                {/* ── Stat Cards ───────────────────────────────────────────────── */}
                <StatCards stats={statsLoading ? null : stats} />

                {/* ── Breakdown panels ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                    <BreakdownPanel
                        title="By Country"
                        icon={<GlobeIcon />}
                        items={stats?.byCountry ?? []}
                        labelKey="country_name"
                        valueKey="count"
                        accentColor="#002e23"
                    />
                    <BreakdownPanel
                        title="By Branch"
                        icon={<BranchIcon />}
                        items={stats?.byBranch ?? []}
                        labelKey="branch"
                        valueKey="count"
                        accentColor="#40916c"
                    />
                </div>

                {/* ── Data Table ───────────────────────────────────────────────── */}
                <DataTable
                    token={token}
                    surveys={surveys}
                    loading={loading}
                    total={total}
                    page={page}
                    totalPages={totalPages}
                    stats={stats}
                    onPageChange={setPage}
                    onSearch={setSearch}
                    onCountryFilter={setCountry}
                    onBranchFilter={setBranch}
                    onRefresh={handleRefresh}
                />
            </main>
        </div>
    );
}