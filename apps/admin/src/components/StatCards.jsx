const TrendUpIcon = () => (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

const UsersIcon = () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const CalendarIcon = () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const GlobeIcon = () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

const cards = [
    {
        key: "total",
        label: "Total Submissions",
        getValue: (s) => s?.summary?.total ?? "—",
        getSub: (s) => `${s?.summary?.english ?? 0} EN · ${s?.summary?.arabic ?? 0} AR`,
        icon: <UsersIcon />,
        accent: "#002e23",
        lightBg: "#f0f7f4",
    },
    {
        key: "week",
        label: "Last 7 Days",
        getValue: (s) => s?.summary?.last_7_days ?? "—",
        getSub: () => "Recent activity",
        icon: <TrendUpIcon />,
        accent: "#2d6a4f",
        lightBg: "#f0f7f4",
    },
    {
        key: "month",
        label: "Last 30 Days",
        getValue: (s) => s?.summary?.last_30_days ?? "—",
        getSub: () => "Monthly total",
        icon: <CalendarIcon />,
        accent: "#40916c",
        lightBg: "#f0f7f4",
    },
    {
        key: "countries",
        label: "Countries",
        getValue: (s) => s?.byCountry?.length ?? "—",
        getSub: (s) => s?.byCountry?.[0]?.country_name ? `Top: ${s.byCountry[0].country_name}` : "Across regions",
        icon: <GlobeIcon />,
        accent: "#1b4332",
        lightBg: "#f0f7f4",
    },
];

export default function StatCards({ stats }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            {cards.map((card, i) => (
                <div
                    key={card.key}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-[#f2eee9] relative overflow-hidden group hover:shadow-md transition-shadow duration-200"
                    style={{ animationDelay: `${i * 60}ms` }}
                >
                    {/* Top accent bar */}
                    <div
                        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                        style={{ background: card.accent }}
                    />

                    {/* Icon + Label */}
                    <div className="flex items-start justify-between mb-4 mt-1">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">
                            {card.label}
                        </p>
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: card.lightBg, color: card.accent }}
                        >
                            {card.icon}
                        </div>
                    </div>

                    {/* Value */}
                    <div
                        className="text-4xl font-black leading-none mb-2 tracking-tight"
                        style={{ color: card.accent }}
                    >
                        {stats ? card.getValue(stats) : (
                            <div className="h-9 w-16 bg-[#f2eee9] rounded-lg animate-pulse" />
                        )}
                    </div>

                    {/* Sub label */}
                    <p className="text-xs text-[#9ca3af] font-medium">
                        {stats ? card.getSub(stats) : "Loading…"}
                    </p>

                    {/* Decorative circle */}
                    <div
                        className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-300"
                        style={{ background: card.accent }}
                    />
                </div>
            ))}
        </div>
    );
}