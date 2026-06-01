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
  
  const CARDS = [
    {
      key: "total",
      label: "Total Submissions",
      getValue: (s) => s?.summary?.total ?? "—",
      getSub: (s) => `${s?.summary?.english ?? 0} EN · ${s?.summary?.arabic ?? 0} AR`,
      icon: <UsersIcon />,
      gradient: "linear-gradient(135deg, #002e23 0%, #1b4332 100%)",
      iconBg: "rgba(255,255,255,0.12)",
    },
    {
      key: "week",
      label: "Last 7 Days",
      getValue: (s) => s?.summary?.last_7_days ?? "—",
      getSub: () => "Recent activity",
      icon: <TrendUpIcon />,
      gradient: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)",
      iconBg: "rgba(255,255,255,0.12)",
    },
    {
      key: "month",
      label: "Last 30 Days",
      getValue: (s) => s?.summary?.last_30_days ?? "—",
      getSub: () => "Monthly total",
      icon: <CalendarIcon />,
      gradient: "linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)",
      iconBg: "rgba(255,255,255,0.12)",
    },
    {
      key: "countries",
      label: "Countries",
      getValue: (s) => s?.byCountry?.length ?? "—",
      getSub: (s) =>
        s?.byCountry?.[0]?.country_name
          ? `Top: ${s.byCountry[0].country_name}`
          : "Across regions",
      icon: <GlobeIcon />,
      gradient: "linear-gradient(135deg, #40916c 0%, #52b788 100%)",
      iconBg: "rgba(255,255,255,0.12)",
    },
  ];
  
  export default function StatCards({ stats }) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {CARDS.map((card, i) => (
          <div
            key={card.key}
            className="relative rounded-2xl p-6 overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            style={{ background: card.gradient, animationDelay: `${i * 60}ms` }}
          >
            {/* Decorative blurred circle */}
            <div
              className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-20"
              style={{ background: "#fff" }}
            />
            {/* Subtle dot grid */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            />
  
            {/* Icon + Label row */}
            <div className="relative z-10 flex items-start justify-between mb-5">
              <p className="text-[11px] font-700 uppercase tracking-widest text-white/60">
                {card.label}
              </p>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                style={{ background: card.iconBg, border: "1px solid rgba(255,255,255,0.15)" }}
              >
                {card.icon}
              </div>
            </div>
  
            {/* Value */}
            <div className="relative z-10 text-4xl font-800 text-white leading-none mb-2 tracking-tight">
              {stats ? card.getValue(stats) : (
                <div className="h-9 w-16 rounded-lg animate-pulse bg-white/20" />
              )}
            </div>
  
            {/* Sub label */}
            <p className="relative z-10 text-xs text-white/50 font-500">
              {stats ? card.getSub(stats) : "Loading…"}
            </p>
          </div>
        ))}
      </div>
    );
  }