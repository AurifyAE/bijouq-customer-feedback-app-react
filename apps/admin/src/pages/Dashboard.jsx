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
  const [sortBy, setSortBy] = useState("submitted_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const LIMIT = 20;

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

  const loadSurveys = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSurveys(token, {
        page, limit: LIMIT, search, country, branch, sortBy, sortOrder,
      });
      setSurveys(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error("Failed to fetch surveys:", err.message);
    } finally {
      setLoading(false);
    }
  }, [token, page, search, country, branch, sortBy, sortOrder]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadSurveys(); }, [loadSurveys]);

  const handleRefresh = () => { loadSurveys(); loadStats(); };

  const handleSort = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f2eee9]">
      <Navbar admin={admin} onLogout={onLogout} />

      {/* ── Hero gradient header ──────────────────────────────────────── */}
      <div
        className="relative overflow-hidden px-6 pt-10 pb-32"
        style={{ background: "linear-gradient(135deg, #002e23 0%, #1b4332 50%, #2d6a4f 100%)" }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-white/5" />
        <div className="absolute top-8 -right-8 w-40 h-40 rounded-full border border-white/5" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/[0.02] border border-white/5" />

        {/* Heading */}
        <div className="relative z-10 max-w-[1440px] mx-auto">
          <p className="text-white/50 text-xs font-600 uppercase tracking-widest mb-1">Overview</p>
          <h1
            className="text-3xl font-800 text-[#f2eee9] tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Survey Dashboard
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {statsLoading
              ? "Loading summary…"
              : `${stats?.summary?.total ?? 0} total submissions across ${stats?.byCountry?.length ?? 0} countries`}
          </p>
        </div>
      </div>

      {/* ── Content pulled up over hero ───────────────────────────────── */}
      <main className="max-w-[1440px] mx-auto px-6 -mt-24 pb-12 relative z-10">

        {/* Stat cards float over the gradient */}
        <StatCards stats={statsLoading ? null : stats} />

        {/* Breakdown panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <BreakdownPanel
            title="By Country" icon={<GlobeIcon />}
            items={stats?.byCountry ?? []} labelKey="country_name"
            valueKey="count" accentColor="#002e23"
          />
          <BreakdownPanel
            title="By Branch" icon={<BranchIcon />}
            items={stats?.byBranch ?? []} labelKey="branch"
            valueKey="count" accentColor="#40916c"
          />
        </div>

        {/* Data table */}
        <DataTable
          token={token}
          surveys={surveys}
          loading={loading}
          total={total}
          page={page}
          totalPages={totalPages}
          stats={stats}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onPageChange={setPage}
          onSearch={setSearch}
          onCountryFilter={setCountry}
          onBranchFilter={setBranch}
          onSort={handleSort}
          onRefresh={handleRefresh}
        />
      </main>
    </div>
  );
}