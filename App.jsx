import { useState, useMemo, useEffect } from "react";

// ── SUPABASE CONFIG ────────────────────────────────────────────────────
// 1. Go to supabase.com → your project → Settings → API
// 2. Copy "Project URL" and paste it below (replacing the placeholder)
// 3. Copy "anon public" key and paste it below (replacing the placeholder)
const SUPABASE_URL = "https://xnuyhifpcwkcplqivmra.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhudXloaWZwY3drY3BscWl2bXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMTkyODcsImV4cCI6MjA5NDc5NTI4N30.OIFmYNOAGXMz5o0ckS7NaQNrDkLcZY3EoAPCm012BvI";

async function fetchPlantsFromSupabase() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/plants?select=*`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch plants from Supabase");
  const rows = await response.json();

  // Supabase stores JSON columns as objects automatically.
  // We just make sure bloomMonths, foliage, seasonal, and maintenance
  // are parsed correctly whether they come back as arrays/objects or strings.
  return rows.map((row) => ({
    ...row,
    bloomMonths: typeof row.bloom_months === "string"
      ? JSON.parse(row.bloom_months)
      : row.bloom_months ?? [],
    foliage: typeof row.foliage === "string"
      ? JSON.parse(row.foliage)
      : row.foliage ?? {},
    seasonal: typeof row.seasonal === "string"
      ? JSON.parse(row.seasonal)
      : row.seasonal ?? {},
    maintenance: typeof row.maintenance === "string"
      ? JSON.parse(row.maintenance)
      : row.maintenance ?? [],
    // Map snake_case DB columns → camelCase used in the UI
    commonName: row.common_name,
    scientificName: row.scientific_name,
    bloomColor: row.bloom_color,
    bloomMonths: typeof row.bloom_months === "string"
      ? JSON.parse(row.bloom_months)
      : row.bloom_months ?? [],
    saltTolerant: row.salt_tolerant,
    hardinessZone: row.hardiness_zone,
    matureWidth: row.mature_width,
    matureHeight: row.mature_height,
    spreadingBehavior: row.spreading_behavior,
    maintenanceNotes: row.maintenance_notes,
  }));
}
// ── END SUPABASE CONFIG ────────────────────────────────────────────────

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const BLOOM_HEX = {
  Red:"#e05050", Orange:"#e8844a", Yellow:"#f0c030", Green:"#6aaa5a",
  Blue:"#5080d0", Purple:"#9966bb", Pink:"#e08898", White:"#e8e4dc",
  "Blue-Purple":"#7c6fac", "Lavender-Blue":"#8899cc",
  "Pink-Purple":"#b870a0", "Pink/Wheat":"#e0a870",
  Cream:"#e8d5a0", None:"transparent", Insignificant:"transparent",
};

const FOLIAGE_GREENS = ["#cccac4","#dde8d5","#c0d8a8","#96c47a","#6aaa50"];

function getSeasonalBg(plant, month) {
  const blooming = plant.bloomMonths.includes(month);
  if (blooming) {
    const hex = BLOOM_HEX[plant.bloomColor];
    if (hex && hex !== "transparent") return hex + "cc";
  }
  const stage = (plant.foliage && plant.foliage[month] !== undefined) ? plant.foliage[month] : 2;
  return FOLIAGE_GREENS[Math.min(stage, 4)];
}

function getSeasonalTextColor(plant, month) {
  const blooming = plant.bloomMonths.includes(month);
  if (blooming) {
    const hex = BLOOM_HEX[plant.bloomColor];
    if (hex && hex !== "transparent") return "rgba(255,255,255,0.92)";
  }
  const stage = (plant.foliage && plant.foliage[month] !== undefined) ? plant.foliage[month] : 2;
  return stage <= 1 ? "#aaa" : "#2C2C24";
}

const LIGHT_OPTS = [
  { value:"Full Sun",  label:"Full Sun",  sub:"6+ hours direct sun" },
  { value:"Part Sun",  label:"Part Sun",  sub:"3–6 hours direct sun" },
  { value:"Shade",     label:"Shade",     sub:"Under 3 hours" },
];
const WATER_OPTS = [
  { value:"None",      label:"No Water",  sub:"Once established" },
  { value:"Low",       label:"Low",       sub:'½" every 2 weeks' },
  { value:"Moderate",  label:"Moderate",  sub:'½" every week' },
  { value:"High",      label:"High",      sub:'½" twice per week' },
];
const TYPE_OPTS = ["Tree","Shrub","Perennial","Ground Cover"];
const BLOOM_COLOR_OPTS = [
  { value:"Red",    swatch:"#e05050" },
  { value:"Orange", swatch:"#e8844a" },
  { value:"Yellow", swatch:"#f0c030" },
  { value:"Green",  swatch:"#6aaa5a" },
  { value:"Blue",   swatch:"#5080d0" },
  { value:"Purple", swatch:"#9966bb" },
  { value:"Pink",   swatch:"#e08898" },
  { value:"White",  swatch:"#e8e4dc" },
];

const C = {
  bg:"#FDFCF8", fg:"#2C2C24", primary:"#5D7052", primFg:"#F3F4F1",
  secondary:"#C18C5D", accent:"#E6DCCD", muted:"#F0EBE5",
  mutedFg:"#78786C", border:"#DED8CF", card:"#FEFEFA",
};

const BLOB_RADII = [
  "60% 40% 30% 70% / 60% 30% 70% 40%",
  "40% 60% 70% 30% / 40% 70% 30% 60%",
  "50% 50% 30% 70% / 30% 70% 50% 50%",
  "70% 30% 60% 40% / 50% 60% 40% 50%",
  "30% 70% 40% 60% / 60% 40% 70% 30%",
  "55% 45% 65% 35% / 45% 65% 35% 55%",
];

const CARD_RADII = [
  "2rem", "2rem 4rem 2rem 2rem", "4rem 2rem 2rem 2rem",
  "2rem 2rem 4rem 2rem", "2rem 2rem 2rem 4rem", "3rem 2rem 4rem 2rem",
];

const TYPE_COLORS = {
  Tree:         { bg:"#dbeafe", text:"#1e3a5f" },
  Shrub:        { bg:"#fce7f3", text:"#6b1a3a" },
  Perennial:    { bg:"#e8f5e9", text:"#1b5e20" },
  "Ground Cover":{ bg:"#fff8e1", text:"#5d4037" },
};

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Nunito:wght@400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #FDFCF8; color: #2C2C24; font-family: 'Nunito', sans-serif; }
body::after {
  content: '';
  position: fixed; inset: 0;
  pointer-events: none; z-index: 9999;
  opacity: 0.03; mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 200px 200px;
}
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #F0EBE5; }
::-webkit-scrollbar-thumb { background: #DED8CF; border-radius: 99px; }
input {
  font-family: 'Nunito', sans-serif;
  width: 100%; height: 48px; padding: 0 20px;
  border-radius: 999px; border: 1.5px solid #DED8CF;
  background: rgba(255,255,255,0.5); color: #2C2C24;
  font-size: 14px; outline: none; transition: all 0.3s;
}
input::placeholder { color: #78786C; }
input:focus { border-color: #5D7052; box-shadow: 0 0 0 3px rgba(93,112,82,0.15); }
input[type=range] {
  height: 5px; padding: 0; border-radius: 999px;
  border: none; background: #DED8CF;
  accent-color: #5D7052; cursor: pointer;
}
input[type=range]:focus { box-shadow: none; }
button { font-family: 'Nunito', sans-serif; cursor: pointer; }
`;

// ── Small shared components ────────────────────────────────────────────

function Blob({ color, size, top, left, right, bottom, opacity, radiusIdx }) {
  const s = size || 300;
  const o = opacity || 0.15;
  const ri = radiusIdx || 0;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute", width: s, height: s,
        top, left, right, bottom,
        background: color,
        borderRadius: BLOB_RADII[ri % BLOB_RADII.length],
        filter: "blur(60px)", opacity: o,
        pointerEvents: "none", zIndex: 0,
      }}
    />
  );
}

function SunIcon({ level, size }) {
  const sz = size || 15;
  const full = level === "Full Sun";
  const part = level === "Part Sun";
  const rayColor = (full || part) ? C.secondary : C.border;
  const fillColor = full ? C.secondary : "transparent";
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg width={sz} height={sz} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      {part && <path d="M8 4.5 A3.5 3.5 0 0 1 8 11.5 Z" fill={C.secondary} />}
      <circle cx="8" cy="8" r="3.5" fill={fillColor} stroke={rayColor} strokeWidth="1" />
      {rays.map((a, i) => {
        const rad = (Math.PI * a) / 180;
        const x1 = 8 + 5 * Math.cos(rad), y1 = 8 + 5 * Math.sin(rad);
        const x2 = 8 + 7 * Math.cos(rad), y2 = 8 + 7 * Math.sin(rad);
        const c = (full || (part && i < 4)) ? C.secondary : C.border;
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="1.2" strokeLinecap="round" />;
      })}
    </svg>
  );
}

const WDROPS = { None: 0, Low: 1, Moderate: 2, High: 3 };
function WaterDots({ level, size }) {
  const sz = size || 8;
  const n = WDROPS[level] !== undefined ? WDROPS[level] : 1;
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {[0, 1, 2, 3].map(i => (
        <svg key={i} width={sz} height={Math.round(sz * 1.35)} viewBox="0 0 8 11" fill="none">
          <path
            d="M4 0.5C4 0.5 0.5 5 0.5 7.5a3.5 3.5 0 007 0C7.5 5 4 0.5 4 0.5Z"
            fill={i < n ? C.primary : "transparent"}
            stroke={i < n ? C.primary : C.border}
            strokeWidth="0.8"
          />
        </svg>
      ))}
    </span>
  );
}

function TypePill({ type }) {
  const tc = TYPE_COLORS[type] || { bg: C.muted, text: C.mutedFg };
  return (
    <span style={{
      display: "inline-block", fontSize: 11, padding: "3px 12px",
      borderRadius: 999, background: tc.bg, color: tc.text,
      fontWeight: 600, letterSpacing: "0.02em",
    }}>
      {type}
    </span>
  );
}

function PhotoSlot({ height, src }) {
  const h = height || 140;
  if (src) {
    return (
      <div style={{ height: h, overflow: "hidden", position: "relative" }}>
        <img
          src={src}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
        />
        <div style={{ display: "none", height: h, background: "linear-gradient(135deg, #F0EBE5 0%, #E6DCCD 100%)", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#78786C" }}>
          Photo unavailable
        </div>
      </div>
    );
  }
  return (
    <div style={{
      height: h,
      background: "linear-gradient(135deg, #F0EBE5 0%, #E6DCCD 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 6,
    }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.3 }}>
        <rect x="2" y="5" width="28" height="22" rx="4" stroke={C.primary} strokeWidth="1.5" />
        <circle cx="11" cy="14" r="3.5" stroke={C.primary} strokeWidth="1.5" />
        <path d="M2 22l7-7 5 5 6-7 10 9" stroke={C.primary} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: 10, color: C.mutedFg, fontWeight: 500 }}>Photo coming soon</span>
    </div>
  );
}

function SeasonPhotoSlot({ plant, month, height }) {
  const h = height || 80;
  const bg = getSeasonalBg(plant, month);
  const blooming = plant.bloomMonths.includes(month);
  const stage = (plant.foliage && plant.foliage[month] !== undefined) ? plant.foliage[month] : 2;
  const label = blooming ? "In Bloom" : stage <= 0 ? "Dormant" : stage <= 1 ? "Emerging" : stage <= 2 ? "Growing" : "Full Leaf";
  return (
    <div style={{
      height: h, background: bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 4,
      position: "relative", overflow: "hidden", transition: "background 0.4s",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(0,0,0,0.1))", pointerEvents: "none" }} />
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.4, position: "relative" }}>
        <rect x="2" y="5" width="28" height="22" rx="4" stroke="white" strokeWidth="1.5" />
        <circle cx="11" cy="14" r="3.5" stroke="white" strokeWidth="1.5" />
        <path d="M2 22l7-7 5 5 6-7 10 9" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.9)", fontWeight: 700, position: "relative", textAlign: "center", lineHeight: 1.3, padding: "0 4px" }}>
        {MONTHS[month - 1]}
        <br />
        {label}
      </span>
    </div>
  );
}

function PrimaryBtn({ children, onClick, fullWidth }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        gap: 6, borderRadius: 999, height: 48,
        padding: "0 28px", fontSize: 14, fontWeight: 700,
        border: "none", cursor: "pointer",
        background: C.primary, color: C.primFg,
        width: fullWidth ? "100%" : undefined,
        transform: hov ? "scale(1.03)" : "scale(1)",
        boxShadow: hov ? "0 6px 24px -4px rgba(93,112,82,0.35)" : "0 4px 20px -2px rgba(93,112,82,0.18)",
        transition: "all 0.3s",
      }}
    >
      {children}
    </button>
  );
}

function OutlineBtn({ children, onClick, small, fullWidth }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        gap: 6, borderRadius: 999,
        height: small ? 36 : 48,
        padding: small ? "0 18px" : "0 28px",
        fontSize: small ? 13 : 14, fontWeight: 700,
        background: hov ? "rgba(93,112,82,0.07)" : "transparent",
        color: C.primary, border: "1.5px solid " + C.primary,
        cursor: "pointer",
        width: fullWidth ? "100%" : undefined,
        transform: hov ? "scale(1.03)" : "scale(1)",
        transition: "all 0.3s",
      }}
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, small }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: hov ? "rgba(93,112,82,0.08)" : "transparent",
        color: C.mutedFg, border: "none", cursor: "pointer",
        padding: small ? "4px 10px" : "6px 14px",
        fontSize: small ? 13 : 14, fontWeight: 700, borderRadius: 999,
        transition: "all 0.2s",
      }}
    >
      {children}
    </button>
  );
}

function FilterSection({ label, activeCount, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen || false);
  const count = activeCount || 0;
  return (
    <div style={{
      marginBottom: 6, borderRadius: "1rem", overflow: "hidden",
      border: "1px solid " + (open ? C.primary + "55" : C.border),
      transition: "border-color 0.2s",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "9px 12px",
          background: open ? "rgba(93,112,82,0.06)" : C.card,
          border: "none", cursor: "pointer", transition: "background 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: open ? C.primary : C.fg }}>
            {label}
          </span>
          {count > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, background: C.primary, color: C.primFg,
              borderRadius: 999, padding: "1px 7px", lineHeight: "18px",
            }}>
              {count}
            </span>
          )}
        </div>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s", opacity: 0.5 }}
        >
          <path d="M2 4l4 4 4-4" stroke={C.fg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div style={{ padding: "6px 8px 10px", background: C.card }}>
          {children}
        </div>
      )}
    </div>
  );
}

function FBtn({ active, onClick, children }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", textAlign: "left", padding: "7px 8px",
        borderRadius: "0.75rem",
        border: "1.5px solid " + (active ? C.primary : (hov ? C.primary : C.border)),
        background: active ? "rgba(93,112,82,0.08)" : C.card,
        cursor: "pointer", marginBottom: 4, transition: "all 0.2s",
      }}
    >
      {children}
    </button>
  );
}

function Sidebar({ filters, setF, setRange, clear, hasActive }) {
  const ac = {
    light: filters.light ? 1 : 0,
    water: filters.water ? 1 : 0,
    type: filters.type ? 1 : 0,
    salt: filters.saltTolerant !== null ? 1 : 0,
    bloomColor: filters.bloomColor ? 1 : 0,
    bloomMonth: filters.bloomMonth ? 1 : 0,
    size: (filters.minHeight > 0 || filters.maxHeight < 30 || filters.minWidth > 0 || filters.maxWidth < 30) ? 1 : 0,
  };

  return (
    <div style={{
      background: C.card, borderRadius: "2rem",
      border: "1.5px solid " + C.border, padding: "1.25rem",
      position: "sticky", top: 76,
      boxShadow: "0 4px 20px -2px rgba(93,112,82,0.1)",
      maxHeight: "calc(100vh - 100px)", overflowY: "auto",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <span style={{ fontFamily: "Fraunces", fontSize: 16, color: C.fg }}>Filter Plants</span>
        {hasActive && (
          <button onClick={clear} style={{ fontSize: 12, color: C.primary, background: "none", border: "none", fontWeight: 700 }}>
            Clear all
          </button>
        )}
      </div>

      <FilterSection label="Sun" activeCount={ac.light} defaultOpen={true}>
        {LIGHT_OPTS.map(o => (
          <FBtn key={o.value} active={filters.light === o.value} onClick={() => setF("light", o.value)}>
            <SunIcon level={o.value} size={13} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: filters.light === o.value ? C.primary : C.fg }}>{o.label}</div>
              <div style={{ fontSize: 10, color: C.mutedFg }}>{o.sub}</div>
            </div>
          </FBtn>
        ))}
      </FilterSection>

      <FilterSection label="Water" activeCount={ac.water} defaultOpen={true}>
        {WATER_OPTS.map(o => (
          <FBtn key={o.value} active={filters.water === o.value} onClick={() => setF("water", o.value)}>
            <WaterDots level={o.value} size={6} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: filters.water === o.value ? C.primary : C.fg }}>{o.label}</div>
              <div style={{ fontSize: 10, color: C.mutedFg }}>{o.sub}</div>
            </div>
          </FBtn>
        ))}
      </FilterSection>

      <FilterSection label="Plant Type" activeCount={ac.type}>
        {TYPE_OPTS.map(t => {
          const tc = TYPE_COLORS[t] || { bg: C.muted, text: C.mutedFg };
          return (
            <FBtn key={t} active={filters.type === t} onClick={() => setF("type", t)}>
              <span style={{ width: 10, height: 10, borderRadius: 999, background: tc.text, flexShrink: 0, display: "inline-block" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: filters.type === t ? C.primary : C.fg }}>{t}</span>
            </FBtn>
          );
        })}
      </FilterSection>

      <FilterSection label="Salt Tolerance" activeCount={ac.salt}>
        <FBtn active={filters.saltTolerant === true} onClick={() => setF("saltTolerant", true)}>
          <span style={{ fontSize: 13 }}>🧂</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: filters.saltTolerant === true ? C.primary : C.fg }}>Salt Tolerant</div>
            <div style={{ fontSize: 10, color: C.mutedFg }}>Handles road salt & coastal</div>
          </div>
        </FBtn>
        <FBtn active={filters.saltTolerant === false} onClick={() => setF("saltTolerant", false)}>
          <span style={{ fontSize: 13 }}>🚫</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: filters.saltTolerant === false ? C.primary : C.fg }}>Not Salt Tolerant</div>
            <div style={{ fontSize: 10, color: C.mutedFg }}>Sensitive to salt</div>
          </div>
        </FBtn>
      </FilterSection>

      <FilterSection label="Bloom Color" activeCount={ac.bloomColor}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, padding: "4px 2px" }}>
          {BLOOM_COLOR_OPTS.map(o => (
            <button
              key={o.value}
              title={o.value}
              onClick={() => setF("bloomColor", o.value)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "3px 0" }}
            >
              <span style={{
                width: 30, height: 30, borderRadius: 999, background: o.swatch, display: "block",
                border: "2px solid " + (filters.bloomColor === o.value ? C.primary : C.border),
                boxShadow: filters.bloomColor === o.value ? "0 0 0 2px " + C.primary + "44" : "none",
                transition: "all 0.2s",
              }} />
              <span style={{ fontSize: 9, color: filters.bloomColor === o.value ? C.primary : C.mutedFg, textAlign: "center", lineHeight: 1.2, fontWeight: filters.bloomColor === o.value ? 700 : 400 }}>
                {o.value}
              </span>
            </button>
          ))}
        </div>
        {filters.bloomColor && (
          <button
            onClick={() => setF("bloomColor", filters.bloomColor)}
            style={{ marginTop: 10, width: "100%", padding: "6px 0", borderRadius: "0.75rem", fontSize: 11, fontWeight: 700, background: "rgba(93,112,82,0.08)", border: "1px solid " + C.primary, color: C.primary, cursor: "pointer", transition: "all 0.2s" }}
          >
            Clear color filter ×
          </button>
        )}
      </FilterSection>

      <FilterSection label="Bloom Month" activeCount={ac.bloomMonth}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, padding: "4px 2px" }}>
          {MONTHS.map((m, i) => {
            const mo = i + 1;
            const active = filters.bloomMonth === mo;
            return (
              <button
                key={m}
                onClick={() => setF("bloomMonth", mo)}
                style={{
                  padding: "5px 2px", borderRadius: "0.6rem", fontSize: 11,
                  fontWeight: active ? 700 : 500,
                  background: active ? C.primary : C.muted,
                  color: active ? C.primFg : C.mutedFg,
                  border: "1px solid " + (active ? C.primary : C.border),
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                {m}
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: 10, color: C.mutedFg, marginTop: 6, paddingLeft: 2 }}>Plants blooming that month</p>
      </FilterSection>

      <FilterSection label="Plant Size" activeCount={ac.size}>
        <div style={{ padding: "4px 4px 0" }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.fg }}>Height</span>
              <span style={{ fontSize: 11, color: C.primary, fontWeight: 700 }}>{filters.minHeight}–{filters.maxHeight}ft</span>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: C.mutedFg, width: 14 }}>0</span>
              <input type="range" min={0} max={30} value={filters.minHeight} onChange={e => setRange("minHeight", Math.min(+e.target.value, filters.maxHeight - 1))} style={{ flex: 1 }} />
              <input type="range" min={0} max={30} value={filters.maxHeight} onChange={e => setRange("maxHeight", Math.max(+e.target.value, filters.minHeight + 1))} style={{ flex: 1 }} />
              <span style={{ fontSize: 10, color: C.mutedFg, width: 22, textAlign: "right" }}>30+</span>
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.fg }}>Width</span>
              <span style={{ fontSize: 11, color: C.primary, fontWeight: 700 }}>{filters.minWidth}–{filters.maxWidth}ft</span>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: C.mutedFg, width: 14 }}>0</span>
              <input type="range" min={0} max={30} value={filters.minWidth} onChange={e => setRange("minWidth", Math.min(+e.target.value, filters.maxWidth - 1))} style={{ flex: 1 }} />
              <input type="range" min={0} max={30} value={filters.maxWidth} onChange={e => setRange("maxWidth", Math.max(+e.target.value, filters.minWidth + 1))} style={{ flex: 1 }} />
              <span style={{ fontSize: 10, color: C.mutedFg, width: 22, textAlign: "right" }}>30+</span>
            </div>
          </div>
        </div>
      </FilterSection>
    </div>
  );
}

function SaveModal({ plant, palettes, onClose, onCreate, onAddTo }) {
  const [name, setName] = useState("");
  const [tab, setTab] = useState("new");

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(44,44,36,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 999, backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.card, borderRadius: "2rem",
          border: "1.5px solid " + C.border, padding: "2rem",
          width: 380, maxWidth: "93vw",
          boxShadow: "0 20px 60px -10px rgba(93,112,82,0.2)",
          position: "relative", overflow: "hidden",
        }}
      >
        <Blob color={C.primary} size={200} top={-80} right={-80} opacity={0.07} radiusIdx={1} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h3 style={{ fontFamily: "Fraunces", fontSize: 20, color: C.fg, marginBottom: 4 }}>Save to a Palette</h3>
          <p style={{ fontSize: 13, color: C.mutedFg, marginBottom: "1.25rem" }}>{plant.commonName}</p>

          <div style={{ display: "flex", gap: 6, marginBottom: "1.25rem", background: C.muted, borderRadius: 999, padding: 4 }}>
            {[{ id: "new", label: "New Palette" }, { id: "add", label: "Add to Existing" }].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1, padding: "7px 0", borderRadius: 999, fontSize: 12, fontWeight: 700,
                  background: tab === t.id ? C.card : "transparent",
                  color: tab === t.id ? C.fg : C.mutedFg,
                  border: "none", cursor: "pointer", transition: "all 0.25s",
                  boxShadow: tab === t.id ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "new" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Palette name (optional)" />
              <PrimaryBtn onClick={() => onCreate(name)} fullWidth>Create Palette</PrimaryBtn>
            </div>
          )}

          {tab === "add" && (
            palettes.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {palettes.map(p => (
                  <button
                    key={p.id}
                    onClick={() => onAddTo(p.id)}
                    style={{
                      textAlign: "left", padding: "12px 16px",
                      background: C.muted, borderRadius: "1rem",
                      border: "1.5px solid " + C.border, cursor: "pointer", transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.background = C.card; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.muted; }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.fg }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: C.mutedFg, marginTop: 2 }}>{p.plants.length} plant{p.plants.length !== 1 ? "s" : ""}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.mutedFg }}>No Palettes Listed</p>
                <p style={{ fontSize: 12, color: C.mutedFg, marginTop: 4 }}>Create a new palette first using the other tab.</p>
              </div>
            )
          )}
        </div>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", fontSize: 20, color: C.mutedFg, lineHeight: 1 }}>×</button>
      </div>
    </div>
  );
}

function PlantCard({ plant, palettes, onSave, onClick, idx }) {
  const [hov, setHov] = useState(false);
  const [modal, setModal] = useState(false);
  const radius = CARD_RADII[(idx || 0) % CARD_RADII.length];

  function handleCreate(name) { onSave("new", plant, name); setModal(false); }
  function handleAddTo(pid) { onSave("add", plant, pid); setModal(false); }

  return (
    <>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: C.card, borderRadius: radius,
          border: "1.5px solid " + C.border, overflow: "hidden",
          display: "flex", flexDirection: "column",
          transform: hov ? "translateY(-4px)" : "translateY(0)",
          boxShadow: hov ? "0 20px 40px -10px rgba(93,112,82,0.18)" : "0 4px 20px -2px rgba(93,112,82,0.09)",
          cursor: "pointer", transition: "all 0.35s",
        }}
      >
        <div onClick={() => onClick(plant)}>
          <PhotoSlot height={130} src={plant.photo} />
          <div style={{ padding: "1rem 1.1rem", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
              <div>
                <div style={{ fontFamily: "Fraunces", fontSize: 16, color: C.fg, lineHeight: 1.3 }}>{plant.commonName}</div>
                <div style={{ fontSize: 11, color: C.mutedFg, fontStyle: "italic", marginTop: 2 }}>{plant.scientificName}</div>
              </div>
              <TypePill type={plant.type} />
            </div>
            <p style={{ fontSize: 12, color: C.mutedFg, lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {plant.description}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 8, borderTop: "1px solid " + C.border }}>
              <SunIcon level={plant.light} size={13} />
              <span style={{ fontSize: 11, color: C.mutedFg }}>{plant.light}</span>
              {plant.saltTolerant && <span title="Salt tolerant" style={{ fontSize: 11 }}>🧂</span>}
              <span style={{ marginLeft: "auto" }}><WaterDots level={plant.water} size={7} /></span>
            </div>
          </div>
        </div>
        <div style={{ padding: "0 1.1rem 1rem" }}>
          <OutlineBtn small fullWidth onClick={e => { e.stopPropagation(); setModal(true); }}>
            + Save to Palette
          </OutlineBtn>
        </div>
      </div>
      {modal && (
        <SaveModal plant={plant} palettes={palettes} onClose={() => setModal(false)} onCreate={handleCreate} onAddTo={handleAddTo} />
      )}
    </>
  );
}

function SeasonalGrid({ plant }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 3 }}>
      {MONTHS.map((m, i) => {
        const mo = i + 1;
        const bg = getSeasonalBg(plant, mo);
        const tc = getSeasonalTextColor(plant, mo);
        const blooming = plant.bloomMonths.includes(mo);
        return (
          <div
            key={m}
            title={plant.seasonal[mo]}
            style={{
              padding: "6px 4px", borderRadius: "0.75rem", background: bg,
              border: "1px solid rgba(0,0,0,0.07)", minHeight: 52,
              cursor: "default", transition: "background 0.3s",
            }}
          >
            <div style={{ fontSize: 8, fontWeight: 700, color: blooming ? "rgba(255,255,255,0.9)" : C.primary, marginBottom: 2 }}>{m}</div>
            <div style={{ fontSize: 7.5, color: tc, lineHeight: 1.4, opacity: 0.9 }}>{plant.seasonal[mo]}</div>
          </div>
        );
      })}
    </div>
  );
}

function PlantDetail({ plant, palettes, onBack, onSave }) {
  const [modal, setModal] = useState(false);

  function handleCreate(name) { onSave("new", plant, name); setModal(false); }
  function handleAddTo(pid) { onSave("add", plant, pid); setModal(false); }

  return (
    <div style={{ paddingBottom: "4rem", position: "relative" }}>
      <Blob color={C.primary} size={400} top={-100} right={-150} opacity={0.06} radiusIdx={2} />
      <Blob color={C.secondary} size={300} top={200} left={-100} opacity={0.07} radiusIdx={4} />

      <button
        onClick={onBack}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginBottom: "2rem",
          background: C.muted, borderRadius: 999, border: "1.5px solid " + C.border,
          padding: "8px 20px", fontSize: 13, fontWeight: 600, color: C.mutedFg,
          transition: "all 0.2s", position: "relative", zIndex: 1,
        }}
        onMouseEnter={e => { e.currentTarget.style.color = C.primary; e.currentTarget.style.borderColor = C.primary; }}
        onMouseLeave={e => { e.currentTarget.style.color = C.mutedFg; e.currentTarget.style.borderColor = C.border; }}
      >
        ← Back to Library
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: "1rem", position: "relative", zIndex: 1 }}>
        <div>
          <TypePill type={plant.type} />
          <h1 style={{ fontFamily: "Fraunces", fontSize: 36, color: C.fg, marginTop: 8, lineHeight: 1.1 }}>{plant.commonName}</h1>
          <p style={{ fontSize: 13, color: C.mutedFg, fontStyle: "italic", marginTop: 4 }}>{plant.scientificName} {plant.variety}</p>
        </div>
        <PrimaryBtn onClick={() => setModal(true)}>+ Save to Palette</PrimaryBtn>
      </div>

      <p style={{ fontSize: 14, color: C.mutedFg, lineHeight: 1.8, marginBottom: "2rem", maxWidth: 600, position: "relative", zIndex: 1 }}>
        {plant.description}
      </p>

      <div style={{ borderRadius: "2rem", overflow: "hidden", border: "1.5px solid " + C.border, marginBottom: "2rem", transform: "rotate(-0.5deg)", boxShadow: "0 8px 30px -5px rgba(93,112,82,0.15)", position: "relative", zIndex: 1 }}>
        <PhotoSlot height={220} src={plant.photo} />
      </div>

      <div style={{ background: C.card, borderRadius: "2rem", border: "1.5px solid " + C.border, padding: "1.5rem", marginBottom: "1.5rem", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.mutedFg, marginBottom: 14 }}>Growing Conditions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
          {[
            { label: "Light",        value: <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><SunIcon level={plant.light} /> {plant.light}</span> },
            { label: "Water",        value: <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><WaterDots level={plant.water} /> {plant.water}</span> },
            { label: "Zone",         value: "Zone " + plant.hardinessZone },
            { label: "Salt Tolerant",value: plant.saltTolerant ? "✓ Yes" : "✗ No" },
            { label: "Height",       value: plant.matureHeight + " ft" },
            { label: "Width",        value: plant.matureWidth + " ft" },
            { label: "Bloom Color",  value: plant.bloomColor || "None" },
            { label: "Evergreen",    value: plant.evergreen ? "Yes" : "No" },
            { label: "Spreading",    value: plant.spreadingBehavior },
          ].map(item => (
            <div key={item.label} style={{ background: C.muted, borderRadius: "1rem", padding: "10px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.mutedFg, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.fg }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {plant.bloomMonths.length > 0 && (
        <div style={{ background: C.card, borderRadius: "2rem", border: "1.5px solid " + C.border, padding: "1.5rem", marginBottom: "1.5rem", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.mutedFg, marginBottom: 14 }}>Bloom Calendar</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 3 }}>
            {MONTHS.map((m, i) => {
              const mo = i + 1;
              const blooming = plant.bloomMonths.includes(mo);
              const bc = BLOOM_HEX[plant.bloomColor] || C.primary;
              return (
                <div key={m} style={{ textAlign: "center" }}>
                  <div style={{ height: 24, borderRadius: 999, background: blooming ? bc : C.muted, border: "1.5px solid " + (blooming ? bc : C.border), transition: "all 0.2s" }} />
                  <div style={{ fontSize: 9, color: C.mutedFg, marginTop: 4 }}>{m.slice(0, 1)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ background: C.card, borderRadius: "2rem", border: "1.5px solid " + C.border, padding: "1.5rem", marginBottom: "1.5rem", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.mutedFg, marginBottom: 6 }}>Seasonal Appearance</div>
        <p style={{ fontSize: 11, color: C.mutedFg, marginBottom: 12 }}>Gray = dormant · greens = foliage stage · bloom color overrides during bloom months</p>
        <SeasonalGrid plant={plant} />
      </div>

      <div style={{ background: C.card, borderRadius: "2rem", border: "1.5px solid " + C.border, padding: "1.5rem", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.mutedFg, marginBottom: 14 }}>Maintenance</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {plant.maintenance.map(m => (
            <span key={m} style={{ fontSize: 12, padding: "4px 14px", borderRadius: 999, background: C.muted, border: "1px solid " + C.border, color: C.fg, fontWeight: 600 }}>{m}</span>
          ))}
        </div>
        <p style={{ fontSize: 13, color: C.mutedFg, lineHeight: 1.7 }}>{plant.maintenanceNotes}</p>
      </div>

      {modal && <SaveModal plant={plant} palettes={palettes} onClose={() => setModal(false)} onCreate={handleCreate} onAddTo={handleAddTo} />}
    </div>
  );
}

function PalettesPage({ palettes, onDelete, onRemove }) {
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  if (!palettes.length) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 2rem", position: "relative", overflow: "hidden" }}>
        <Blob color={C.primary} size={300} top={50} left="50%" opacity={0.07} radiusIdx={0} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ width: 64, height: 64, borderRadius: BLOB_RADII[0], background: C.muted, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 4C14 4 7 12 7 17a7 7 0 0014 0C21 12 14 4 14 4Z" stroke={C.primary} strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <h3 style={{ fontFamily: "Fraunces", fontSize: 22, color: C.fg, marginBottom: 8 }}>No palettes yet</h3>
          <p style={{ fontSize: 13, color: C.mutedFg }}>Browse the library and save plants to build your first palette.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: "4rem", position: "relative" }}>
      <Blob color={C.primary} size={350} top={-80} right={-100} opacity={0.06} radiusIdx={1} />
      <h2 style={{ fontFamily: "Fraunces", fontSize: 28, color: C.fg, marginBottom: "1.5rem", position: "relative", zIndex: 1 }}>My Plant Palettes</h2>

      <div style={{ background: C.card, borderRadius: "1.5rem", border: "1.5px solid " + C.border, padding: "1rem 1.25rem", marginBottom: "1.5rem", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.mutedFg, marginBottom: 10 }}>
          Viewing: <span style={{ color: C.primary }}>{MONTHS[month - 1]}</span>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {MONTHS.map((m, i) => (
            <button
              key={m}
              onClick={() => setMonth(i + 1)}
              style={{
                padding: "5px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                background: month === i + 1 ? C.primary : C.muted,
                border: "1px solid " + (month === i + 1 ? C.primary : C.border),
                color: month === i + 1 ? C.primFg : C.mutedFg,
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", position: "relative", zIndex: 1 }}>
        {palettes.map((p, pi) => (
          <div
            key={p.id}
            style={{
              background: C.card, borderRadius: CARD_RADII[pi % CARD_RADII.length],
              border: "1.5px solid " + C.border, overflow: "hidden",
              boxShadow: "0 4px 20px -2px rgba(93,112,82,0.09)",
            }}
          >
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg," + C.muted + "," + C.accent + "22)" }}>
              <div>
                <h3 style={{ fontFamily: "Fraunces", fontSize: 18, color: C.fg }}>{p.name}</h3>
                <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 2 }}>{p.plants.length} plant{p.plants.length !== 1 ? "s" : ""}</div>
              </div>
              <GhostBtn small onClick={() => onDelete(p.id)}>Remove</GhostBtn>
            </div>
            <div style={{ padding: "1.25rem 1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {p.plants.map(pl => {
                  const bg = getSeasonalBg(pl, month);
                  const blooming = pl.bloomMonths.includes(month);
                  const stage = (pl.foliage && pl.foliage[month] !== undefined) ? pl.foliage[month] : 2;
                  const stageLabel = blooming ? "In Bloom" : stage <= 0 ? "Dormant" : stage <= 1 ? "Emerging" : stage <= 2 ? "Growing" : "Full Leaf";
                  return (
                    <div key={pl.id} style={{ display: "flex", borderRadius: "1.25rem", border: "1px solid " + C.border, overflow: "hidden", background: C.card }}>
                      <div style={{ width: 90, flexShrink: 0, position: "relative", overflow: "hidden" }}>
                        {pl.photo && (
                          <img src={pl.photo} alt={pl.commonName} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                        <div style={{ position: "absolute", inset: 0, background: bg, opacity: pl.photo ? 0.55 : 1, transition: "background 0.4s" }} />
                        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "6px 4px" }}>
                          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.95)", fontWeight: 700, textAlign: "center", lineHeight: 1.3, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                            {MONTHS[month - 1]}<br />{stageLabel}
                          </span>
                        </div>
                      </div>
                      <div style={{ flex: 1, padding: "10px 12px", minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
                          <div>
                            <div style={{ fontFamily: "Fraunces", fontSize: 13, color: C.fg, lineHeight: 1.3 }}>{pl.commonName}</div>
                            <div style={{ fontSize: 10, color: C.mutedFg, fontStyle: "italic", marginTop: 1 }}>{pl.scientificName}</div>
                          </div>
                          <button onClick={() => onRemove(p.id, pl.id)} style={{ background: "none", border: "none", color: C.mutedFg, fontSize: 14, lineHeight: 1, cursor: "pointer", flexShrink: 0 }}>×</button>
                        </div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 11, color: C.mutedFg, marginBottom: 6 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><SunIcon level={pl.light} size={11} /> {pl.light}</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><WaterDots level={pl.water} size={6} /> {pl.water}</span>
                          <span>↕ {pl.matureHeight}ft</span>
                          <span>↔ {pl.matureWidth}ft</span>
                          {pl.saltTolerant && <span>🧂</span>}
                        </div>
                        <div style={{ fontSize: 11, color: C.mutedFg, fontStyle: "italic", lineHeight: 1.4, background: bg + "44", borderRadius: "0.5rem", padding: "4px 8px" }}>
                          {pl.seasonal[month]}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Loading & Error States ─────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{
        width: 48, height: 48,
        borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
        background: C.primary, opacity: 0.15,
        animation: "pulse 1.5s ease-in-out infinite",
      }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:0.15;transform:scale(1)} 50%{opacity:0.3;transform:scale(1.1)} }`}</style>
      <p style={{ fontFamily: "Fraunces", fontSize: 16, color: C.mutedFg }}>Loading plants…</p>
    </div>
  );
}

function ErrorScreen({ message, onRetry }) {
  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "2rem", textAlign: "center" }}>
      <div style={{ fontSize: 40 }}>🌱</div>
      <h3 style={{ fontFamily: "Fraunces", fontSize: 20, color: C.fg }}>Couldn't load plants</h3>
      <p style={{ fontSize: 13, color: C.mutedFg, maxWidth: 360, lineHeight: 1.6 }}>
        {message || "Something went wrong connecting to the database. Make sure your Supabase URL and key are set correctly in App.jsx."}
      </p>
      <OutlineBtn onClick={onRetry}>Try Again</OutlineBtn>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS = {
  light: "", water: "", type: "", saltTolerant: null,
  bloomColor: "", bloomMonth: null,
  minHeight: 0, maxHeight: 30, minWidth: 0, maxWidth: 30,
};

export default function App() {
  const [view, setView] = useState("browse");
  const [detail, setDetail] = useState(null);
  const [palettes, setPalettes] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // ── NEW: data fetching state ──
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadPlants() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPlantsFromSupabase();
      setPlants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlants();
  }, []);
  // ── END data fetching ──

  function setF(key, val) {
    setFilters(prev => {
      const same = prev[key] === val;
      if (key === "saltTolerant") return { ...prev, [key]: same ? null : val };
      return { ...prev, [key]: same ? "" : val };
    });
  }

  function setRange(key, val) {
    setFilters(prev => ({ ...prev, [key]: +val }));
  }

  function clear() {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
  }

  const hasActive = !!search || Object.entries(filters).some(([k, v]) => {
    if (k === "saltTolerant") return v !== null;
    if (k === "minHeight" || k === "minWidth") return v > 0;
    if (k === "maxHeight" || k === "maxWidth") return v < 30;
    return !!v;
  });

  function save(mode, plant, nameOrId) {
    if (mode === "new") {
      const ls = plant.light.includes("Full") ? "FS" : plant.light.includes("Part") ? "PS" : "SH";
      const ws = plant.water.slice(0, 2).toUpperCase();
      const ts = plant.type.slice(0, 3).toUpperCase();
      const auto = ls + " " + ws + " " + ts + " Mix #" + (palettes.length + 1);
      const name = (nameOrId || "").trim() || auto;
      setPalettes(prev => [...prev, { id: Date.now(), name, plants: [plant] }]);
    } else {
      setPalettes(prev => prev.map(pal => {
        if (pal.id !== nameOrId) return pal;
        if (pal.plants.find(x => x.id === plant.id)) return pal;
        return { ...pal, plants: [...pal.plants, plant] };
      }));
    }
  }

  const filtered = useMemo(() => plants.filter(p => {
    const q = search.toLowerCase();
    if (q && !p.commonName.toLowerCase().includes(q) && !p.scientificName.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
    if (filters.light && p.light !== filters.light) return false;
    if (filters.water && p.water !== filters.water) return false;
    if (filters.type && p.type !== filters.type) return false;
    if (filters.saltTolerant !== null && p.saltTolerant !== filters.saltTolerant) return false;
    if (filters.bloomColor && p.bloomColor !== filters.bloomColor) return false;
    if (filters.bloomMonth && !p.bloomMonths.includes(filters.bloomMonth)) return false;
    if (p.matureHeight < filters.minHeight || p.matureHeight > filters.maxHeight) return false;
    if (p.matureWidth < filters.minWidth || p.matureWidth > filters.maxWidth) return false;
    return true;
  }), [plants, search, filters]);

  const isDetail = view === "detail";
  const isBrowse = view === "browse";
  const isPalette = view === "palette";

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ minHeight: "100vh", background: C.bg, position: "relative", overflow: "hidden" }}>
        <Blob color={C.primary} size={500} top={-200} right={-200} opacity={0.05} radiusIdx={0} />
        <Blob color={C.secondary} size={400} bottom={-150} left={-150} opacity={0.06} radiusIdx={3} />

        <nav style={{ position: "sticky", top: 12, zIndex: 100, maxWidth: 1080, margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{
            background: "rgba(253,252,248,0.85)", backdropFilter: "blur(12px)",
            borderRadius: 999, border: "1.5px solid " + C.border,
            padding: "0 8px 0 20px", display: "flex", alignItems: "center",
            justifyContent: "space-between", height: 56,
            boxShadow: "0 4px 20px -2px rgba(93,112,82,0.12)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2C8 2 4 7 4 10a4 4 0 008 0C12 7 8 2 8 2Z" fill="white" />
                  <path d="M8 6C8 6 4 8 3 11c2 .5 3.5 0 5-1" fill="white" opacity="0.6" />
                </svg>
              </div>
              <span style={{ fontFamily: "Fraunces", fontSize: 15, color: C.fg, fontWeight: 600 }}>Plant Mix & Matcher</span>
            </div>
            <div style={{ display: "flex", gap: 4, background: C.muted, borderRadius: 999, padding: 4 }}>
              {[
                { id: "browse", label: "Library" },
                { id: "palette", label: "Palettes" + (palettes.length > 0 ? " · " + palettes.length : "") },
              ].map(tab => {
                const active = (tab.id === "browse" && (isBrowse || isDetail)) || tab.id === view;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setView(tab.id); setDetail(null); }}
                    style={{
                      padding: "6px 18px", borderRadius: 999, fontSize: 13, fontWeight: 700,
                      border: "none", cursor: "pointer",
                      background: active ? C.card : "transparent",
                      color: active ? C.fg : C.mutedFg,
                      boxShadow: active ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                      transition: "all 0.25s",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "1.5rem 1.5rem 4rem", position: "relative", zIndex: 1 }}>

          {isDetail && detail && (
            <PlantDetail
              plant={detail}
              palettes={palettes}
              onBack={() => { setView("browse"); setDetail(null); }}
              onSave={save}
            />
          )}

          {isBrowse && (
            loading ? <LoadingScreen /> :
            error   ? <ErrorScreen message={error} onRetry={loadPlants} /> :
            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "1.5rem", alignItems: "start" }}>
              <Sidebar filters={filters} setF={setF} setRange={setRange} clear={clear} hasActive={hasActive} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem" }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", opacity: 0.4, pointerEvents: "none" }}>
                      <circle cx="6" cy="6" r="4.5" stroke={C.primary} strokeWidth="1.5" />
                      <line x1="9.5" y1="9.5" x2="13" y2="13" stroke={C.primary} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plants..." style={{ paddingLeft: 38 }} />
                  </div>
                  <span style={{ fontSize: 12, color: C.mutedFg, fontWeight: 600, whiteSpace: "nowrap" }}>
                    {filtered.length} plant{filtered.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "4rem", color: C.mutedFg }}>
                    <p style={{ fontSize: 13 }}>
                      No plants match your filters.{" "}
                      <button onClick={clear} style={{ background: "none", border: "none", color: C.primary, cursor: "pointer", fontSize: "inherit", fontWeight: 700 }}>
                        Clear filters
                      </button>
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 14 }}>
                    {filtered.map((p, i) => (
                      <PlantCard
                        key={p.id}
                        plant={p}
                        palettes={palettes}
                        onSave={save}
                        idx={i}
                        onClick={pl => { setDetail(pl); setView("detail"); }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {isPalette && (
            <PalettesPage
              palettes={palettes}
              onDelete={id => setPalettes(prev => prev.filter(x => x.id !== id))}
              onRemove={(pid, plid) => setPalettes(prev => prev.map(pal => pal.id !== pid ? pal : { ...pal, plants: pal.plants.filter(x => x.id !== plid) }))}
            />
          )}

        </div>
      </div>
    </>
  );
}
