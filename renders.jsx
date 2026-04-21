// 3D Renders gallery — shows architectural renderings with lightbox

const RENDERS = [
  {
    src: "renders/front.jpg",
    title: "Front elevation",
    caption: "Approach / garage side — primary street view",
    tag: "FRONT",
  },
  {
    src: "renders/roof-dormer.jpg",
    title: "Rear dormer & roof",
    caption: "New dormer over primary suite; stone + shingle transition",
    tag: "ROOF",
  },
  {
    src: "renders/rear-chimney.jpg",
    title: "Rear elevation — chimney",
    caption: "Stone chimney mass, walk-out basement, upper deck",
    tag: "BACK",
  },
  {
    src: "renders/rear-deck.jpg",
    title: "Rear deck & terrace",
    caption: "Cantilevered deck, stone patio, outdoor kitchen zone",
    tag: "BACK",
  },
];

function RendersSection({ onOpen }) {
  return (
    <section style={{ marginTop: 32 }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        marginBottom: 14,
      }}>
        <Label>3D Renders</Label>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
          color: "#8a8579", letterSpacing: "0.1em",
        }}>
          ARCHITECTURAL VISUALIZATION · {RENDERS.length} VIEWS
        </div>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr",
        gridTemplateRows: "220px 180px",
        gap: 12,
      }}
      className="renders-grid renders-overview-grid"
      >
        {/* Hero (front) */}
        <button onClick={() => onOpen(0)}
          style={{
            gridRow: "1 / span 2", gridColumn: "1",
            border: "1px solid rgba(26,26,26,0.15)", padding: 0,
            background: "#1a1a1a", cursor: "pointer", position: "relative",
            overflow: "hidden", fontFamily: "inherit",
          }}>
          <img src={RENDERS[0].src} alt={RENDERS[0].title} style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
          }}/>
          <RenderOverlay r={RENDERS[0]} large />
        </button>
        {RENDERS.slice(1).map((r, i) => (
          <button key={r.src} onClick={() => onOpen(i + 1)}
            style={{
              border: "1px solid rgba(26,26,26,0.15)", padding: 0,
              background: "#1a1a1a", cursor: "pointer", position: "relative",
              overflow: "hidden", fontFamily: "inherit",
            }}>
            <img src={r.src} alt={r.title} style={{
              width: "100%", height: "100%", objectFit: "cover", display: "block",
            }}/>
            <RenderOverlay r={r} />
          </button>
        ))}
      </div>
    </section>
  );
}

function RenderOverlay({ r, large }) {
  return (
    <div className="render-overlay">
      <div style={{
        position: "absolute", top: 10, left: 10,
        padding: "4px 7px", background: "#c9470a", color: "#f5f2ec",
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
        letterSpacing: "0.12em",
      }}>{r.tag}</div>
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        padding: large ? "16px 18px" : "10px 12px",
        background: "linear-gradient(to top, rgba(26,26,26,0.85), rgba(26,26,26,0))",
        color: "#f5f2ec", textAlign: "left",
      }}>
        <div style={{
          fontSize: large ? 18 : 13, fontWeight: 500, letterSpacing: "-0.01em",
        }}>{r.title}</div>
        {large && (
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
            color: "#d4d0c5", marginTop: 4, letterSpacing: "0.04em",
          }}>{r.caption}</div>
        )}
      </div>
    </div>
  );
}

function RenderLightbox({ index, onClose, onPrev, onNext }) {
  if (index == null) return null;
  const r = RENDERS[index];
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [index]);
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15,15,15,0.94)",
      zIndex: 2000, display: "flex", flexDirection: "column",
      padding: "48px 64px",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        color: "#f5f2ec", marginBottom: 20,
      }}>
        <div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
            letterSpacing: "0.12em", color: "#8a8579",
          }}>RENDER {String(index + 1).padStart(2, "0")} / {String(RENDERS.length).padStart(2, "0")} · {r.tag}</div>
          <div style={{ fontSize: 22, fontWeight: 500, marginTop: 4, letterSpacing: "-0.01em" }}>{r.title}</div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{
          background: "transparent", border: "1px solid #3a3a3a",
          color: "#f5f2ec", padding: "8px 14px",
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
          letterSpacing: "0.12em", cursor: "pointer",
        }}>CLOSE ✕</button>
      </div>
      <div onClick={(e) => e.stopPropagation()} style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: 0, gap: 20,
      }}>
        <button onClick={onPrev} style={arrowBtn}>←</button>
        <img src={r.src} alt={r.title} style={{
          maxWidth: "100%", maxHeight: "100%", objectFit: "contain",
          border: "1px solid #2a2a2a",
        }}/>
        <button onClick={onNext} style={arrowBtn}>→</button>
      </div>
      <div style={{
        color: "#d4d0c5", fontSize: 13, marginTop: 16, textAlign: "center",
        fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.04em",
      }}>{r.caption}</div>
    </div>
  );
}

const arrowBtn = {
  width: 44, height: 44, background: "transparent",
  border: "1px solid #3a3a3a", color: "#f5f2ec",
  fontSize: 18, cursor: "pointer", flexShrink: 0,
};

function RendersView({ onClose }) {
  return (
    <div className="renders-page" style={{
      flex: 1, overflowY: "auto", background: "#f5f2ec", padding: "32px 40px 40px",
      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    }}>
      <Label>Visualization</Label>
      <div className="overview-hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 6, marginBottom: 24 }}>
        <h1 className="overview-title" style={{ margin: 0, fontSize: 40, fontWeight: 500, letterSpacing: "-0.02em" }}>
          3D Renders
        </h1>
        <div className="page-subtitle" style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8a8579",
          textAlign: "right",
        }}>
          <div>ARCHITECTURAL VISUALIZATION</div>
          <div>HASKELL + CO. · REV 3 · FEB 2026</div>
        </div>
      </div>
      <div className="renders-full-grid" style={{
        display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16,
      }}>
        {RENDERS.map((r, i) => (
          <button key={r.src} onClick={() => onClose(i)} style={{
            border: "1px solid rgba(26,26,26,0.15)", padding: 0,
            background: "#1a1a1a", cursor: "pointer", position: "relative",
            overflow: "hidden", fontFamily: "inherit", aspectRatio: "4 / 3",
          }}>
            <img src={r.src} alt={r.title} style={{
              width: "100%", height: "100%", objectFit: "cover", display: "block",
            }}/>
            <RenderOverlay r={r} large />
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { RENDERS, RendersSection, RenderLightbox, RendersView });

