import { useState } from "react";
import { DetailModal, DeleteModal } from "./Modal";
import { deleteSurvey, exportToCSV } from "../services/adminApi";

// ─── Icons ────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const EyeIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const TrashIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
);
const DownloadIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const FilterIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

// Sort direction icons
const SortAscIcon = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);
const SortDescIcon = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const SortNeutralIcon = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" opacity="0.4"/>
    <polyline points="6 9 12 15 18 9" opacity="0.4"/>
  </svg>
);

// ─── Sortable column config ────────────────────────────────────────────────
const COLUMNS = [
  { label: "#",         key: "id",                  sortable: true  },
  { label: "Phone",     key: "phone",               sortable: true  },
  { label: "Country",   key: "country_name",        sortable: true  },
  { label: "Full Name", key: "full_name",            sortable: true  },
  { label: "Branch",    key: "bijouq_branch", sortable: true  },
  { label: "Heard Via", key: "hear_about_us",       sortable: false },
  { label: "Lang",      key: "language",            sortable: true  },
  { label: "Submitted", key: "submitted_at",        sortable: true  },
  { label: "Actions",   key: "actions",             sortable: false },
];

// ─── Sort Header Cell ──────────────────────────────────────────────────────
const SortTh = ({ col, sortBy, sortOrder, onSort }) => {
  const isActive = sortBy === col.key;
  const thBase = "px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest whitespace-nowrap select-none";

  if (!col.sortable) {
    return (
      <th className={`${thBase} text-[#9ca3af]`}>
        {col.label}
      </th>
    );
  }

  const handleClick = () => {
    if (isActive) {
      onSort(col.key, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSort(col.key, "asc");
    }
  };

  return (
    <th
      className={`${thBase} cursor-pointer group transition-colors
        ${isActive ? "text-[#002e23]" : "text-[#9ca3af] hover:text-[#002e23]"}`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-1.5">
        {col.label}
        <span className={`transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`}>
          {isActive
            ? sortOrder === "asc" ? <SortAscIcon /> : <SortDescIcon />
            : <SortNeutralIcon />}
        </span>
        {isActive && (
          <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-[#002e23] inline-block" />
        )}
      </div>
    </th>
  );
};

// ─── Badge ────────────────────────────────────────────────────────────────
const LangBadge = ({ lang }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-700 tracking-wider uppercase
    ${lang === "ar"
      ? "bg-amber-50 text-amber-700 border border-amber-200"
      : "bg-[#f0f7f4] text-[#002e23] border border-[#002e23]/20"
    }`}>
    {lang?.toUpperCase() ?? "—"}
  </span>
);

// ─── Skeleton Row ─────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-b border-[#f2eee9]">
    {[40, 120, 100, 160, 140, 140, 50, 100, 80].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-3.5 rounded-full bg-[#f2eee9] animate-pulse" style={{ width: w }} />
      </td>
    ))}
  </tr>
);

// ─── DataTable ────────────────────────────────────────────────────────────
export default function DataTable({
  token,
  surveys,
  loading,
  total,
  page,
  totalPages,
  stats,
  sortBy,
  sortOrder,
  onPageChange,
  onSearch,
  onCountryFilter,
  onBranchFilter,
  onSort,
  onRefresh,
}) {
  const [searchInput, setSearchInput] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchInput.trim());
    onPageChange(1);
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteSurvey(token, id);
      setDeleteId(null);
      onRefresh();
    } catch (err) {
      console.error("Delete failed:", err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    onSearch("");
    onPageChange(1);
  };

  const handleSort = (key, order) => {
    onSort(key, order);
    onPageChange(1);
  };

  return (
    <>
      {/* ── Card ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#f2eee9]">

        {/* ── Toolbar ──────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-[#f2eee9] flex flex-wrap gap-3 items-center">

          {/* Search */}
          <form onSubmit={handleSearch} className="flex flex-1 min-w-[220px] max-w-sm">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                <SearchIcon />
              </span>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name, phone, QID…"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#e5e7eb] rounded-l-xl outline-none bg-[#fafaf9] text-[#1a1a1a] placeholder-[#9ca3af] focus:border-[#002e23] focus:bg-white transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#002e23] text-white text-sm font-600 rounded-r-xl hover:bg-[#1b4332] transition-colors"
            >
              Search
            </button>
          </form>

          {/* Country filter */}
          <div className="flex items-center gap-1.5 text-[#6b7280]">
            <FilterIcon />
            <select
              onChange={(e) => { onCountryFilter(e.target.value); onPageChange(1); }}
              className="text-sm border border-[#e5e7eb] rounded-xl px-3 py-2.5 bg-[#fafaf9] text-[#1a1a1a] outline-none focus:border-[#002e23] cursor-pointer transition-colors"
            >
              <option value="">All Countries</option>
              {stats?.byCountry?.map((c) => (
                <option key={c.country_code} value={c.country_code}>
                  {c.country_name}
                </option>
              ))}
            </select>
          </div>

          {/* Branch filter */}
          <select
            onChange={(e) => { onBranchFilter(e.target.value); onPageChange(1); }}
            className="text-sm border border-[#e5e7eb] rounded-xl px-3 py-2.5 bg-[#fafaf9] text-[#1a1a1a] outline-none focus:border-[#002e23] cursor-pointer transition-colors"
          >
            <option value="">All Branches</option>
            {stats?.byBranch?.map((b) => (
              <option key={b.branch} value={b.branch}>
                {b.branch}
              </option>
            ))}
          </select>

          {/* Clear search */}
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="text-xs text-[#6b7280] underline hover:text-[#002e23] transition-colors"
            >
              Clear
            </button>
          )}

          <div className="flex-1" />

          {/* Active sort indicator */}
          {sortBy && sortBy !== "submitted_at" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f0f7f4] border border-[#002e23]/20 text-[#002e23] text-xs font-600">
              Sorted by: <span className="font-700">{sortBy.replace(/_/g, " ")}</span>
              <span className="text-[10px] uppercase">{sortOrder}</span>
              <button
                onClick={() => { onSort("submitted_at", "desc"); onPageChange(1); }}
                className="ml-1 text-[#002e23]/50 hover:text-[#002e23] transition-colors"
                title="Reset sort"
              >
                ✕
              </button>
            </div>
          )}

          {/* Record count */}
          <span className="text-xs text-[#9ca3af] font-500 whitespace-nowrap">
            {total} record{total !== 1 ? "s" : ""}
          </span>

          {/* Export CSV */}
          <button
            onClick={() => exportToCSV(surveys)}
            disabled={surveys.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-600 rounded-xl border-2 border-[#002e23] text-[#002e23] hover:bg-[#002e23] hover:text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <DownloadIcon />
            Export CSV
          </button>
        </div>

        {/* ── Table ────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b border-[#f2eee9] bg-[#fafaf9]">
                {COLUMNS.map((col) => (
                  <SortTh
                    key={col.key}
                    col={col}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : surveys.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-sm text-[#9ca3af]">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">🔍</span>
                      <span>No records found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                surveys.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`border-b border-[#f2eee9] hover:bg-[#f9fdf9] transition-colors group
                      ${i % 2 === 0 ? "bg-white" : "bg-[#fdfcfb]"}`}
                  >
                    {/* ID */}
                    <td className="px-4 py-3.5 text-xs font-700 text-[#9ca3af]">
                      {row.id}
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3.5 text-sm text-[#374151] font-500 whitespace-nowrap">
                      {row.phone}
                    </td>

                    {/* Country */}
                    <td className="px-4 py-3.5 text-sm text-[#374151] whitespace-nowrap">
                      {row.country_name ?? "—"}
                    </td>

                    {/* Full Name */}
                    <td className="px-4 py-3.5 max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">
                      <span className="text-sm font-600 text-[#002e23]">{row.full_name}</span>
                    </td>

                    {/* Branch */}
                    <td className="px-4 py-3.5 max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap text-sm text-[#374151]">
                      {row.bijouq_branch ?? <span className="text-[#d1d5db]">—</span>}
                    </td>

                    {/* Heard Via */}
                    <td className="px-4 py-3.5 max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap text-sm text-[#374151]">
                      {row.hear_about_us ?? <span className="text-[#d1d5db]">—</span>}
                    </td>

                    {/* Language */}
                    <td className="px-4 py-3.5">
                      <LangBadge lang={row.language} />
                    </td>

                    {/* Submitted */}
                    <td className="px-4 py-3.5 text-xs text-[#9ca3af] whitespace-nowrap">
                      {new Date(row.submitted_at).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedRow(row)}
                          title="View details"
                          className="w-7 h-7 rounded-lg bg-[#f0f7f4] text-[#002e23] flex items-center justify-center hover:bg-[#002e23] hover:text-white transition-all"
                        >
                          <EyeIcon />
                        </button>
                        <button
                          onClick={() => setDeleteId(row.id)}
                          title="Delete"
                          className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ───────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-[#f2eee9] flex items-center justify-between">
          <span className="text-xs text-[#9ca3af]">
            Page <span className="font-700 text-[#002e23]">{page}</span> of{" "}
            <span className="font-700 text-[#002e23]">{totalPages || 1}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1 || loading}
              onClick={() => onPageChange(page - 1)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-600 rounded-xl border border-[#e5e7eb] text-[#374151] hover:border-[#002e23] hover:text-[#002e23] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeftIcon /> Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = totalPages <= 5 ? i + 1
                  : page <= 3 ? i + 1
                  : page >= totalPages - 2 ? totalPages - 4 + i
                  : page - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-600 transition-all
                      ${p === page
                        ? "bg-[#002e23] text-white shadow-sm"
                        : "text-[#6b7280] hover:bg-[#f2eee9] hover:text-[#002e23]"
                      }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              disabled={page === totalPages || loading || totalPages === 0}
              onClick={() => onPageChange(page + 1)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-600 rounded-xl border border-[#e5e7eb] text-[#374151] hover:border-[#002e23] hover:text-[#002e23] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRightIcon />
            </button>
          </div>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <DetailModal row={selectedRow} onClose={() => setSelectedRow(null)} />
      <DeleteModal
        id={deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        deleting={deleting}
      />
    </>
  );
}