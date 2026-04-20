// Left rail: vertical phase timeline

function PhaseRail({ phases, selectedId, onSelect, progress, personaPhase }) {
  return (
    <div style={{
      width: 320, minWidth: 320,
      background: "#efebe2",
      borderRight: "1px solid rgba(26,26,26,0.12)",
      display: "flex", flexDirection: "column",
      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    }}>
      <div style={{ padding: "22px 24px 18px", borderBottom: "1px solid rgba(26,26,26,0.12)" }}>
        <Label>Project Phases</Label>
        <div style={{
          marginTop: 8, fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11, color: "#1a1a1a",
          display: "flex", justifyContent: "space-between",
        }}>
          <span>{phases.length} phases</span>
          <span>{Math.round(progress * 100)}% overall</span>
        </div>
        <div style={{
          marginTop: 8, height: 3, background: "#d9d3c3", position: "relative",
        }}>
          <div style={{
            position: "absolute", left: 0, top: 0, height: "100%",
            width: `${progress * 100}%`, background: "#c9470a",
          }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {phases.map((p, i) => {
          const status = statusFromProgress(i, phases.length, progress);
          const selected = p.id === selectedId;
          const isPersona = personaPhase === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              style={{
                width: "100%", textAlign: "left", cursor: "pointer",
                padding: "14px 24px 14px 24px",
                display: "grid",
                gridTemplateColumns: "24px 1fr auto",
                gap: 12, alignItems: "center",
                background: selected ? "#f5f2ec" : "transparent",
                border: "none",
                borderLeft: selected ? "3px solid #c9470a" : "3px solid transparent",
                position: "relative",
                fontFamily: "inherit",
              }}
            >
              {/* connector line */}
              {i < phases.length - 1 && (
                <div style={{
                  position: "absolute", left: 24 + 12 - 0.5, top: 32, bottom: -10,
                  width: 1, background: "rgba(26,26,26,0.15)",
                }} />
              )}
              <div style={{ display: "flex", justifyContent: "center", zIndex: 1 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: "#efebe2",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <StatusDot status={status} />
                </div>
              </div>
              <div>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                  color: "#8a8579", letterSpacing: "0.08em",
                }}>
                  PHASE {p.num}
                  {isPersona && <span style={{ color: "#c9470a", marginLeft: 8 }}>· YOUR PHASE</span>}
                </div>
                <div style={{
                  fontSize: 14, fontWeight: 500, color: "#1a1a1a", marginTop: 2,
                  letterSpacing: "-0.01em",
                }}>{p.name}</div>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                  color: "#8a8579", marginTop: 3,
                }}>{p.trade} · {p.duration}d</div>
              </div>
              <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: "#8a8579" }}>
                {status === "complete" && "✓"}
                {status === "in-progress" && "●"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { PhaseRail });
