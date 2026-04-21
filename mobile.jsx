// Responsive hook + mobile nav drawer

function useIsMobile(bp = 900) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= bp : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [bp]);
  return isMobile;
}

// ─── Mobile Drawer ────────────────────────────────────────────────
function MobileDrawer({
  open, onClose, view, onViewChange,
  persona, onPersonaChange, personas,
  editMode, onSignIn, onExitEdit,
  phases, selectedId, onSelectPhase, progress,
}) {
  if (!open) return null;
  const [phasesOpen, setPhasesOpen] = useState(view === "phase");
  const views = [
    { id: "overview", label: "Overview" },
    { id: "schedule", label: "Schedule" },
    { id: "renders",  label: "Renders" },
    { id: "plans",    label: "Plans" },
  ];
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 2500,
      background: "rgba(15,15,15,0.55)",
      display: "flex", justifyContent: "flex-end",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(88vw, 360px)", height: "100%",
        background: "#1a1a1a", color: "#f5f2ec",
        display: "flex", flexDirection: "column",
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        overflowY: "auto",
      }}>
        {/* Drawer header */}
        <div style={{
          padding: "18px 20px", display: "flex", alignItems: "center",
          gap: 12, borderBottom: "1px solid #2a2a2a",
        }}>
          <div style={{
            width: 28, height: 28, background: "#c9470a",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600,
          }}>35</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>35 PHILLIPS RD</div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
              color: "#8a8579", letterSpacing: "0.1em",
            }}>PROJECT HUB</div>
          </div>
          <button onClick={onClose} style={{
            background: "transparent", border: "none", color: "#f5f2ec",
            cursor: "pointer", fontSize: 24, lineHeight: 1, padding: 4,
          }}>×</button>
        </div>

        {/* Nav */}
        <div style={{ padding: "14px 10px 6px" }}>
          {/* Flat views */}
          {views.map(v => (
            <button key={v.id} onClick={() => { onViewChange(v.id); onClose(); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "14px 14px", background: view === v.id ? "#2a2a2a" : "transparent",
                color: view === v.id ? "#f5f2ec" : "#d4d0c5",
                borderLeft: view === v.id ? "3px solid #c9470a" : "3px solid transparent",
                border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 15, fontWeight: view === v.id ? 500 : 400,
              }}>{v.label}</button>
          ))}

          {/* Phases — collapsible */}
          <button
            onClick={() => setPhasesOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              width: "100%", textAlign: "left",
              padding: "14px 14px",
              background: view === "phase" ? "#2a2a2a" : "transparent",
              color: view === "phase" ? "#f5f2ec" : "#d4d0c5",
              borderLeft: view === "phase" ? "3px solid #c9470a" : "3px solid transparent",
              border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: 15, fontWeight: view === "phase" ? 500 : 400,
            }}>
            <span>Phases</span>
            <svg width="12" height="12" viewBox="0 0 12 12" style={{
              transform: phasesOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 150ms", flexShrink: 0,
            }}>
              <polyline points="2,4 6,8 10,4" fill="none" stroke="currentColor" strokeWidth="1.8"/>
            </svg>
          </button>

          {/* Phase sub-list */}
          {phasesOpen && (
            <div style={{ borderLeft: "3px solid #2a2a2a", marginLeft: 14 }}>
              {phases.map((p) => {
                const status = statusFromMilestones(p);
                const selected = p.id === selectedId && view === "phase";
                return (
                  <button key={p.id}
                    onClick={() => { onSelectPhase(p.id); onClose(); }}
                    style={{
                      display: "grid", gridTemplateColumns: "16px 1fr auto",
                      gap: 10, width: "100%", textAlign: "left",
                      padding: "11px 14px",
                      background: selected ? "#2a2a2a" : "transparent",
                      borderLeft: selected ? "3px solid #c9470a" : "3px solid transparent",
                      border: "none", cursor: "pointer", color: "#f5f2ec",
                      fontFamily: "inherit", alignItems: "center",
                    }}>
                    <span style={{ display: "flex", justifyContent: "center" }}>
                      <StatusDot status={status} />
                    </span>
                    <span>
                      <span style={{
                        fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
                        color: "#8a8579", letterSpacing: "0.08em",
                      }}>PHASE {p.num}</span>
                      <div style={{ fontSize: 13, marginTop: 1 }}>{p.name}</div>
                    </span>
                    <span style={{
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                      color: "#8a8579",
                    }}>{p.duration}d</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* GC */}
        <div style={{ padding: "14px 20px 18px", borderTop: "1px solid #2a2a2a", marginTop: 6 }}>
          <div style={{ marginTop: 0 }}>
            {editMode ? (
              <button onClick={() => { onExitEdit(); }} style={{
                width: "100%", padding: "12px", background: "#c9470a", color: "#f5f2ec",
                border: "1px solid #c9470a",
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
                letterSpacing: "0.14em", cursor: "pointer",
              }}>EDIT MODE · EXIT</button>
            ) : (
              <button onClick={() => { onSignIn(); onClose(); }} style={{
                width: "100%", padding: "12px", background: "transparent", color: "#f5f2ec",
                border: "1px solid #3a3a3a",
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
                letterSpacing: "0.14em", cursor: "pointer",
              }}>GC SIGN IN</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Top Bar ───────────────────────────────────────────────
function MobileTopBar({ onMenu, view, selectedPhase, editMode }) {
  const title = view === "phase" && selectedPhase
    ? selectedPhase.name
    : view === "overview" ? "Overview"
    : view === "schedule" ? "Schedule"
    : view === "renders"  ? "Renders"
    : "35 Phillips";
  return (
    <div style={{
      height: 56, background: "#1a1a1a", color: "#f5f2ec",
      display: "flex", alignItems: "center", gap: 14,
      padding: "0 6px 0 14px", flexShrink: 0,
      borderBottom: editMode ? "2px solid #c9470a" : "1px solid #000",
      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    }}>
      <div style={{
        width: 28, height: 28, background: "#c9470a",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600,
      }}>35</div>
      <div style={{ flex: 1 }} />
      {editMode && (
        <div style={{
          padding: "4px 8px", background: "#c9470a", color: "#f5f2ec",
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
          letterSpacing: "0.14em",
        }}>EDIT</div>
      )}
      <button onClick={onMenu} aria-label="Menu" style={{
        width: 44, height: 44, background: "transparent", border: "none",
        color: "#f5f2ec", cursor: "pointer", padding: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="22" height="22" viewBox="0 0 22 22">
          <rect x="3" y="5"  width="16" height="2" fill="currentColor"/>
          <rect x="3" y="10" width="16" height="2" fill="currentColor"/>
          <rect x="3" y="15" width="16" height="2" fill="currentColor"/>
        </svg>
      </button>
    </div>
  );
}

Object.assign(window, { useIsMobile, MobileDrawer, MobileTopBar });
