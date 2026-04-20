// Plans gallery — architect-approved plan drawings (placeholder until real files uploaded)

const PLANS = [
  { title: "Site plan",        caption: "Lot layout, setbacks, zoning",         tag: "A-100" },
  { title: "Foundation plan",  caption: "Footings, slab, load-bearing walls",   tag: "A-101" },
  { title: "First floor plan", caption: "Living, kitchen, entry, garage",       tag: "A-102" },
  { title: "Second floor plan",caption: "Bedrooms, baths, primary suite",       tag: "A-103" },
];

// Inline SVG placeholder for each plan — blueprint aesthetic
function PlanPlaceholder({ tag }) {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"
      style={{ width: "100%", height: "100%", display: "block", background: "#0f2a3a" }}>
      <defs>
        <pattern id={`grid-${tag}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 L 0 0 0 20" fill="none" stroke="rgba(245,242,236,0.08)" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill={`url(#grid-${tag})`} />
      {/* outer wall */}
      <rect x="60" y="60" width="280" height="180"
        fill="none" stroke="#f5f2ec" strokeWidth="2"/>
      {/* interior walls */}
      <line x1="180" y1="60"  x2="180" y2="150" stroke="#f5f2ec" strokeWidth="1.5"/>
      <line x1="180" y1="150" x2="340" y2="150" stroke="#f5f2ec" strokeWidth="1.5"/>
      <line x1="240" y1="150" x2="240" y2="240" stroke="#f5f2ec" strokeWidth="1.5"/>
      {/* door swings */}
      <path d="M60,200 A 20 20 0 0 1 80 220" fill="none" stroke="#f5f2ec" strokeWidth="1"/>
      <path d="M180,105 A 15 15 0 0 1 195 120" fill="none" stroke="#f5f2ec" strokeWidth="1"/>
      {/* dimension ticks */}
      <line x1="60" y1="50" x2="340" y2="50" stroke="#c9470a" strokeWidth="1"/>
      <line x1="60" y1="45" x2="60" y2="55" stroke="#c9470a" strokeWidth="1"/>
      <line x1="340" y1="45" x2="340" y2="55" stroke="#c9470a" strokeWidth="1"/>
      <text x="200" y="44" fill="#c9470a" fontSize="10"
        fontFamily="'IBM Plex Mono', monospace" textAnchor="middle" letterSpacing="1">
        PLACEHOLDER
      </text>
      {/* sheet tag */}
      <g transform="translate(340, 260)">
        <rect x="-50" y="-18" width="50" height="22" fill="#c9470a"/>
        <text x="-25" y="-3" fill="#f5f2ec" fontSize="11" fontWeight="600"
          fontFamily="'IBM Plex Mono', monospace" textAnchor="middle">
          {tag}
        </text>
      </g>
    </svg>
  );
}

function PlansView() {
  return (
    <div className="overview-root" style={{
      flex: 1, overflowY: "auto", background: "#f5f2ec", padding: "32px 40px 40px",
      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    }}>
      <Label>Architectural drawings</Label>
      <div className="overview-hero" style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        marginTop: 6, marginBottom: 10, gap: 16, flexWrap: "wrap",
      }}>
        <h1 className="overview-title" style={{ margin: 0, fontSize: 40, fontWeight: 500, letterSpacing: "-0.02em" }}>
          Plans
        </h1>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8a8579",
          textAlign: "right",
        }}>
          <div>HASKELL + CO. ARCHITECTS</div>
          <div>PERMIT SET · PLACEHOLDERS UNTIL UPLOAD</div>
        </div>
      </div>

      <div style={{
        padding: "10px 14px", marginBottom: 24,
        border: "1px dashed rgba(26,26,26,0.25)", background: "rgba(201,71,10,0.06)",
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#7a3a12",
        letterSpacing: "0.04em",
      }}>
        PLACEHOLDER PLANS — REPLACE WITH ARCHITECT-APPROVED PDFS / IMAGES WHEN AVAILABLE.
      </div>

      <div className="renders-full-grid" style={{
        display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16,
      }}>
        {PLANS.map((pl) => (
          <div key={pl.tag} style={{
            border: "1px solid rgba(26,26,26,0.15)",
            background: "#0f2a3a", position: "relative",
            overflow: "hidden", aspectRatio: "4 / 3",
          }}>
            <PlanPlaceholder tag={pl.tag}/>
            {/* overlay */}
            <div style={{
              position: "absolute", top: 10, left: 10,
              padding: "4px 7px", background: "#c9470a", color: "#f5f2ec",
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
              letterSpacing: "0.12em",
            }}>{pl.tag}</div>
            <div style={{
              position: "absolute", left: 0, right: 0, bottom: 0,
              padding: "16px 18px",
              background: "linear-gradient(to top, rgba(15,42,58,0.95), rgba(15,42,58,0))",
              color: "#f5f2ec", textAlign: "left",
            }}>
              <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.01em" }}>
                {pl.title}
              </div>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                color: "#d4d0c5", marginTop: 4, letterSpacing: "0.04em",
              }}>{pl.caption}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { PLANS, PlansView });
