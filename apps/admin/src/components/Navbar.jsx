const LogoutIcon = () => (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
);

const DiamondIcon = () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z" />
    </svg>
);

export default function Navbar({ admin, onLogout }) {
    return (
        <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-8 bg-[#002e23] border-b border-white/10">

            {/* Left — Brand */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#f2eee9]">
                    <DiamondIcon />
                </div>
                <div>
                    <div
                        className="text-[#f2eee9] text-base font-800 leading-tight tracking-tight"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                        Bijouq
                    </div>
                    <div className="text-white/40 text-[10px] tracking-widest uppercase">
                        Admin Portal
                    </div>
                </div>
            </div>

            {/* Right — Admin info + Logout */}
            <div className="flex items-center gap-5">

                {/* Admin badge */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#f2eee9] flex items-center justify-center text-[#002e23] text-sm font-800 flex-shrink-0">
                        {admin?.email?.[0]?.toUpperCase() ?? "A"}
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-[#f2eee9] text-sm font-600">
                            Administrator
                        </span>
                        <span className="text-white/40 text-[11px]">
                            {admin?.email ?? ""}
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-white/10" />

                {/* Logout button */}
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-white/10 text-[#f2eee9] text-sm font-600 hover:bg-white/20 hover:border-white/30 transition-all duration-150 cursor-pointer"
                >
                    <LogoutIcon />
                    Logout
                </button>
            </div>
        </header>
    );
}