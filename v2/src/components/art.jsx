// Built-in product illustrations (SVG). They always load, scale crisply, and match the brand.
// Real photos still win: set `imageUrl` on a product and <ProductImage> shows the photo instead.
const BG = '#fffbf0';
const hex = (cx, cy, r) =>
  [...Array(6)].map((_, i) => { const a = (Math.PI / 3) * i + Math.PI / 6; return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`; }).join(' ');
const Shadow = ({ cx = 100, cy = 138, rx = 60 }) => <ellipse cx={cx} cy={cy} rx={rx} ry="7" fill="#072336" opacity=".12" />;

export const Defs = () => (
  <defs>
    <linearGradient id="g-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6f9fb" /><stop offset=".45" stopColor="#b7c3ce" /><stop offset=".6" stopColor="#e3e9ee" /><stop offset="1" stopColor="#8796a3" /></linearGradient>
    <linearGradient id="g-zinc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f1f4f7" /><stop offset=".5" stopColor="#c3ced8" /><stop offset="1" stopColor="#a4b2be" /></linearGradient>
    <linearGradient id="g-amber" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd470" /><stop offset=".55" stopColor="#f9a401" /><stop offset="1" stopColor="#c47c00" /></linearGradient>
    <linearGradient id="g-navy" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3b5d77" /><stop offset="1" stopColor="#072336" /></linearGradient>
    <linearGradient id="g-dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5b6772" /><stop offset="1" stopColor="#1a2128" /></linearGradient>
    <radialGradient id="g-rmetal" cx=".35" cy=".3" r=".85"><stop offset="0" stopColor="#ffffff" /><stop offset=".55" stopColor="#c0cbd5" /><stop offset="1" stopColor="#7f8e9b" /></radialGradient>
  </defs>
);

const ART = {
  bolt: (
    <g><Shadow rx={66} />
      <g transform="translate(-12 -10) scale(1.14) rotate(-20 100 80)">
        <rect x="68" y="66" width="90" height="28" rx="2" fill="url(#g-zinc)" />
        {[...Array(11)].map((_, i) => <path key={i} d={`M${74 + i * 8} 66l5 28`} stroke="#8a99a6" strokeWidth="2.4" />)}
        <rect x="36" y="54" width="36" height="52" rx="7" fill="url(#g-metal)" />
        <rect x="36" y="54" width="36" height="9" rx="4" fill="#fff" opacity=".6" />
        <path d="M49 54v52M60 54v52" stroke="#7f8e9b" strokeWidth="1" opacity=".5" />
      </g></g>
  ),
  nut: (
    <g><Shadow /><polygon points={hex(100, 86, 58)} fill="#8796a3" />
      <polygon points={hex(100, 78, 58)} fill="url(#g-metal)" stroke="#8796a3" />
      <polygon points={hex(100, 78, 48)} fill="none" stroke="#fff" opacity=".65" strokeWidth="2" />
      <circle cx="100" cy="78" r="27" fill="#5b6772" /><circle cx="100" cy="78" r="21" fill="#1a2128" />
      <circle cx="100" cy="78" r="21" fill="none" stroke="#9aa8b5" strokeDasharray="3 3" /></g>
  ),
  washer: (
    <g><Shadow rx={64} />{[[114, 68], [88, 84]].map(([x, y], i) => (
      <g key={i}><circle cx={x} cy={y} r="48" fill="url(#g-rmetal)" stroke="#8796a3" />
        <circle cx={x} cy={y} r="21" fill="#2b3640" /><circle cx={x} cy={y} r="21" fill="none" stroke="#fff" opacity=".7" strokeWidth="2" /></g>))}</g>
  ),
  screw: (
    <g><Shadow rx={64} /><g transform="rotate(-26 100 80)">
      <path d="M70 70 L152 76 L160 80 L152 84 L70 90Z" fill="url(#g-zinc)" />
      {[...Array(9)].map((_, i) => <path key={i} d={`M${78 + i * 9} 71l4 18`} stroke="#8a99a6" strokeWidth="2.2" />)}
      <ellipse cx="62" cy="80" rx="17" ry="24" fill="url(#g-metal)" stroke="#8796a3" />
      <path d="M56 72l12 16M68 72L56 88" stroke="#5b6772" strokeWidth="2.4" strokeLinecap="round" /></g></g>
  ),
  bearing: (
    <g><Shadow cy={142} rx={58} /><circle cx="100" cy="76" r="60" fill="url(#g-rmetal)" stroke="#7f8e9b" />
      <circle cx="100" cy="76" r="47" fill="#2b3640" />
      {[...Array(9)].map((_, i) => <circle key={i} cx={100 + 37 * Math.cos((i * 2 * Math.PI) / 9)} cy={76 + 37 * Math.sin((i * 2 * Math.PI) / 9)} r="9" fill="url(#g-rmetal)" stroke="#7f8e9b" strokeWidth=".6" />)}
      <circle cx="100" cy="76" r="27" fill="url(#g-rmetal)" stroke="#7f8e9b" /><circle cx="100" cy="76" r="15" fill="#1a2128" /></g>
  ),
  oil: (
    <g><Shadow rx={56} />
      <path d="M142 74q24 4 22 28q-2 22-22 24" fill="none" stroke="#0b2e45" strokeWidth="8" strokeLinecap="round" />
      <path d="M64 60h68a10 10 0 0 1 10 10v60a10 10 0 0 1-10 10H64a10 10 0 0 1-10-10V70a10 10 0 0 1 10-10z" fill="url(#g-amber)" />
      <rect x="84" y="40" width="28" height="22" rx="4" fill="url(#g-navy)" /><rect x="80" y="31" width="36" height="12" rx="3" fill="#0b2e45" />
      <rect x="62" y="84" width="72" height="36" rx="4" fill="#fffbf0" /><rect x="62" y="84" width="72" height="10" rx="3" fill="#072336" />
      <path d="M98 99c5 6 7 9 7 12a7 7 0 0 1-14 0c0-3 2-6 7-12z" fill="#f9a401" /></g>
  ),
  gloves: (
    <g><Shadow rx={52} /><rect x="68" y="118" width="64" height="22" rx="6" fill="#0b2e45" />
      {[[70, 46], [87, 58], [104, 54], [121, 42]].map(([x, h], i) => (
        <g key={i}><rect x={x - 2} y={78 - h} width="16" height={h + 24} rx="8" fill="url(#g-navy)" /><rect x={x - 2} y={78 - h} width="16" height="16" rx="8" fill="url(#g-amber)" /></g>))}
      <rect x="64" y="72" width="72" height="54" rx="16" fill="url(#g-navy)" />
      <g transform="rotate(-38 52 112)"><rect x="42" y="82" width="18" height="44" rx="9" fill="url(#g-navy)" /><rect x="42" y="82" width="18" height="15" rx="8" fill="url(#g-amber)" /></g>
      {[84, 96, 108, 120].map((x) => <circle key={x} cx={x} cy="104" r="3" fill="#f9a401" opacity=".9" />)}</g>
  ),
  spanner: (
    <g><Shadow rx={64} /><g transform="rotate(-34 100 80)">
      <rect x="44" y="71" width="112" height="18" rx="9" fill="url(#g-metal)" stroke="#8796a3" />
      <circle cx="152" cy="80" r="23" fill="url(#g-metal)" stroke="#8796a3" /><polygon points={hex(152, 80, 12)} fill={BG} stroke="#8796a3" />
      <circle cx="48" cy="80" r="23" fill="url(#g-metal)" stroke="#8796a3" /><rect x="20" y="72" width="38" height="16" fill={BG} />
      <path d="M58 72h4M58 88h4" stroke="#8796a3" /></g></g>
  ),
  cable: (
    <g><Shadow rx={60} />
      <path d="M142 120q22 18 44 6" fill="none" stroke="#e29600" strokeWidth="9" strokeLinecap="round" />
      <circle cx="96" cy="76" r="54" fill="none" stroke="#f9a401" strokeWidth="11" /><circle cx="96" cy="76" r="43" fill="none" stroke="#d98f00" strokeWidth="11" />
      <circle cx="96" cy="76" r="32" fill="none" stroke="#f9a401" strokeWidth="11" /><circle cx="96" cy="76" r="21" fill="none" stroke="#d98f00" strokeWidth="11" />
      <circle cx="96" cy="76" r="12" fill="#fffbf0" opacity=".9" />
      <rect x="64" y="18" width="64" height="14" rx="3" fill="#072336" /><rect x="64" y="18" width="64" height="5" rx="2" fill="#fff" opacity=".25" /></g>
  ),
  helmet: (
    <g><Shadow rx={68} /><path d="M42 110a58 58 0 0 1 116 0z" fill="url(#g-amber)" />
      <path d="M90 52h20v58H90z" fill="#e29600" /><path d="M58 90a44 44 0 0 1 22-30" fill="none" stroke="#fff" opacity=".55" strokeWidth="5" strokeLinecap="round" />
      <path d="M28 110h144a7 7 0 0 1 0 13H28a7 7 0 0 1 0-13z" fill="#c47c00" />
      <rect x="84" y="36" width="32" height="12" rx="5" fill="#0b2e45" /></g>
  ),
  marker: (
    <g><Shadow rx={62} /><g transform="rotate(-28 100 80)">
      <rect x="46" y="67" width="92" height="26" rx="9" fill="url(#g-dark)" /><rect x="98" y="67" width="16" height="26" fill="url(#g-amber)" />
      <rect x="58" y="74" width="30" height="12" rx="3" fill="#fffbf0" opacity=".9" />
      <path d="M138 72l24 8-24 8z" fill="#dfe6ec" /><path d="M156 77l9 3-9 3z" fill="#1a2128" /></g></g>
  ),
  fitting: (
    <g><Shadow rx={70} /><rect x="22" y="66" width="62" height="28" rx="14" fill="url(#g-navy)" /><rect x="116" y="66" width="62" height="28" rx="14" fill="url(#g-navy)" />
      <rect x="76" y="50" width="48" height="60" rx="7" fill="url(#g-metal)" stroke="#8796a3" />
      <rect x="70" y="56" width="10" height="48" rx="3" fill="url(#g-amber)" /><rect x="120" y="56" width="10" height="48" rx="3" fill="url(#g-amber)" />
      <path d="M92 50v60M108 50v60" stroke="#7f8e9b" opacity=".5" /></g>
  ),
  tape: (
    <g><Shadow rx={66} /><circle cx="118" cy="70" r="46" fill="url(#g-navy)" /><circle cx="118" cy="70" r="20" fill={BG} />
      <circle cx="86" cy="86" r="50" fill="url(#g-amber)" stroke="#c47c00" /><circle cx="86" cy="86" r="23" fill={BG} stroke="#c47c00" />
      <circle cx="86" cy="86" r="38" fill="none" stroke="#fff" opacity=".35" strokeWidth="3" /></g>
  ),
  sealant: (
    <g><Shadow rx={64} /><g transform="rotate(-20 100 80)">
      <rect x="54" y="58" width="92" height="44" rx="9" fill="url(#g-navy)" /><path d="M146 58l14 7v30l-14 7z" fill="#dfe6ec" stroke="#8796a3" />
      <rect x="32" y="66" width="26" height="28" rx="4" fill="url(#g-amber)" /><rect x="22" y="75" width="12" height="10" rx="2" fill="#c47c00" />
      <rect x="76" y="58" width="42" height="44" fill="#fffbf0" opacity=".95" /><path d="M97 70c6 7 8 11 8 14a8 8 0 0 1-16 0c0-3 2-7 8-14z" fill="#f9a401" /></g></g>
  ),
  box: (
    <g><Shadow rx={62} /><polygon points="100,34 164,62 164,116 100,144 36,116 36,62" fill="#d9a441" />
      <polygon points="100,34 164,62 100,90 36,62" fill="#f1c368" /><polygon points="100,90 164,62 164,116 100,144" fill="#c48f2c" />
      <path d="M100 90v54M68 48l64 28" stroke="#fffbf0" strokeWidth="9" opacity=".8" /></g>
  ),
};

export const ART_KEYS = Object.keys(ART);
const CAT_ART = { fasteners: 'bolt', bearings: 'bearing', 'electrical-items': 'cable', lubricants: 'oil', tools: 'spanner', 'safety-items': 'helmet', 'industrial-stationery': 'marker', 'hydraulics-pneumatics': 'fitting', 'adhesives-sealants': 'sealant' };
export const artFor = (art, category) => (ART[art] ? art : CAT_ART[category] || 'box');

export function ProductArt({ art, category, className }) {
  return (
    <svg viewBox="0 0 200 160" preserveAspectRatio="xMidYMid meet" aria-hidden="true" className={className}>
      <Defs />{ART[artFor(art, category)]}
    </svg>
  );
}

/** Larger illustrated scene for the home hero: a bearing, helmet, bolt and tape on a soft amber disc. */
export function HeroArt({ className }) {
  const at = (key, x, y, w) => <svg x={x} y={y} width={w} height={w * 0.8} viewBox="0 0 200 160" overflow="visible">{ART[key]}</svg>;
  return (
    <svg viewBox="0 0 520 380" className={className} role="img" aria-label="Illustration of industrial supplies: a ball bearing, safety helmet, bolt, spanner and tape">
      <Defs />
      <circle cx="262" cy="190" r="170" fill="#fff1cc" /><circle cx="262" cy="190" r="125" fill="#fce3a0" opacity=".55" />
      {at('bearing', 70, 40, 250)}{at('helmet', 270, 20, 230)}{at('spanner', 20, 210, 220)}{at('tape', 285, 195, 180)}{at('bolt', 150, 262, 130)}
      <circle cx="470" cy="330" r="7" fill="#f9a401" /><circle cx="52" cy="80" r="5" fill="#072336" opacity=".25" />
    </svg>
  );
}
