/** Силуэт Новосибирска: мост, Оперный, «сибирские» высотки. Декор hero-блока. */
export function CitySkyline({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 300"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="currentColor">
        {/* земля */}
        <rect x="0" y="286" width="1440" height="14" opacity="0.5" />

        {/* мост через Обь */}
        <path d="M40 286V196h12v90Z" />
        <path d="M548 286V196h12v90Z" />
        <path d="M40 168h520v10H40Z" />
        <path
          d="M64 172C150 96 398 96 536 172"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
        />
        {Array.from({ length: 11 }, (_, i) => {
          const x = 74 + i * 44
          const t = (x - 64) / 472
          const y = 172 - Math.sin(Math.PI * t) * 66
          return <path key={x} d={`M${x} 172V${y}`} stroke="currentColor" strokeWidth="2.5" opacity="0.75" />
        })}
        {[104, 148, 192, 236, 280, 324, 368, 412, 456].map((x) => (
          <rect key={x} x={x} y="176" width="5" height="110" opacity="0.5" />
        ))}

        {/* левобережье */}
        <rect x="0" y="240" width="36" height="46" rx="3" />
        <rect x="60" y="250" width="26" height="36" rx="3" />
        <rect x="94" y="228" width="40" height="58" rx="3" />
        <rect x="140" y="252" width="30" height="34" rx="3" />

        {/* центр: Оперный театр */}
        <rect x="612" y="214" width="176" height="72" rx="4" />
        <path d="M612 216c0-54 40-92 88-92s88 38 88 92Z" />
        <rect x="640" y="224" width="120" height="10" rx="4" opacity="0.6" />
        <path d="M694 124v-26" stroke="currentColor" strokeWidth="4" />

        {/* высотки */}
        <rect x="820" y="182" width="54" height="104" rx="3" />
        <rect x="886" y="146" width="44" height="140" rx="3" />
        <rect x="942" y="204" width="66" height="82" rx="3" />
        <rect x="1020" y="166" width="34" height="120" rx="3" />
        <rect x="1066" y="222" width="60" height="64" rx="3" />
        <rect x="1140" y="192" width="46" height="94" rx="3" />

        {/* телебашня */}
        <rect x="1246" y="86" width="8" height="200" />
        <rect x="1238" y="112" width="24" height="6" rx="3" />
        <circle cx="1250" cy="70" r="9" />
        <path d="M1250 70v-30" stroke="currentColor" strokeWidth="2.5" />

        {/* дальний план */}
        <rect x="1312" y="236" width="52" height="50" rx="3" opacity="0.7" />
        <rect x="1374" y="254" width="40" height="32" rx="3" opacity="0.7" />
        <rect x="1298" y="250" width="8" height="36" opacity="0.6" />
      </g>
    </svg>
  )
}
