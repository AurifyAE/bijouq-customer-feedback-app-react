import { useEffect } from "react";

const XIcon = () => (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const TrashIcon = () => (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4h6v2" />
    </svg>
);

// ─── Field Row ───────────────────────────────────────────────────────────
const Field = ({ label, value }) => (
    <div className="flex gap-4 py-3 border-b border-[#f2eee9] last:border-0">
        <span className="text-[11px] font-700 uppercase tracking-widest text-[#9ca3af] w-40 flex-shrink-0 pt-0.5">
            {label}
        </span>
        <span className="text-sm text-[#1a1a1a] break-words flex-1">
            {value || <span className="text-[#d1d5db]">—</span>}
        </span>
    </div>
);

// ─── Detail Modal ────────────────────────────────────────────────────────
export function DetailModal({ row, onClose }) {
    // Close on Escape key
    useEffect(() => {
        if (!row) return;
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [row, onClose]);

    if (!row) return null;

    const fields = [
        ["Submission ID", `#${row.id}`],
        ["Phone", row.phone],
        ["Country", `${row.country_name ?? "—"} (${row.country_code ?? "—"})`],
        ["Full Name", row.full_name],
        ["Gov ID / QID", row.emirates_id],
        ["Date of Birth", row.date_of_birth],
        ["Heard About Us", row.hear_about_us],
        ["Heard About Us (Other)", row.hear_about_us_other],
        ["Jewelry Collections", row.jewelry_collections],
        ["Collections (Other)", row.jewelry_collections_other],
        ["Branch", row.blue_diamond_branch],
        ["Language", row.language?.toUpperCase()],
        ["Feedback", row.feedback],
        ["Submitted At", new Date(row.submitted_at).toLocaleString()],
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,46,35,0.45)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden shadow-2xl"
                style={{ boxShadow: "0 32px 80px rgba(0,46,35,.2)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-7 py-5 border-b border-[#f2eee9]">
                    <div>
                        <h2 className="text-base font-800 text-[#002e23] tracking-tight"
                            style={{ fontFamily: "'DM Serif Display', serif" }}>
                            Submission Detail
                        </h2>
                        <p className="text-xs text-[#9ca3af] mt-0.5">#{row.id} · {row.full_name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-[#f2eee9] flex items-center justify-center text-[#6b7280] hover:bg-[#e8e2db] hover:text-[#002e23] transition-colors"
                    >
                        <XIcon />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto px-7 py-4 flex-1">
                    {fields.map(([label, value]) => (
                        <Field key={label} label={label} value={value} />
                    ))}
                </div>

                {/* Footer */}
                <div className="px-7 py-4 border-t border-[#f2eee9] bg-[#fafaf9]">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl text-sm font-600 text-[#002e23] border-2 border-[#002e23] hover:bg-[#002e23] hover:text-white transition-all duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────
export function DeleteModal({ id, onConfirm, onCancel, deleting }) {
    useEffect(() => {
        if (!id) return;
        const handler = (e) => { if (e.key === "Escape") onCancel(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [id, onCancel]);

    if (!id) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,46,35,0.45)", backdropFilter: "blur(6px)" }}
            onClick={onCancel}
        >
            <div
                className="bg-white rounded-3xl w-full max-w-sm p-8 text-center shadow-2xl"
                style={{ boxShadow: "0 32px 80px rgba(0,46,35,.2)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5 text-red-500">
                    <TrashIcon />
                </div>

                <h3
                    className="text-lg font-800 text-[#002e23] mb-2"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                    Delete Submission?
                </h3>
                <p className="text-sm text-[#6b7280] mb-7 leading-relaxed">
                    Submission <span className="font-700 text-[#002e23]">#{id}</span> will be
                    permanently removed. This action cannot be undone.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={deleting}
                        className="flex-1 py-3 rounded-xl text-sm font-600 text-[#002e23] border-2 border-[#f2eee9] bg-[#f2eee9] hover:bg-[#e8e2db] transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(id)}
                        disabled={deleting}
                        className="flex-1 py-3 rounded-xl text-sm font-700 bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {deleting ? "Deleting…" : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}