// Top bar, tweaks panel, and main app shell

function TopBar({ persona, onPersonaChange, personas, view, onViewChange, editMode, onSignIn, onExitEdit }) {
  return (
    <div style={{
      height: 64, background: "#1a1a1a", color: "#f5f2ec",
      display: "flex", alignItems: "center",
      padding: "0 24px", gap: 24,
      borderBottom: "1px solid #000",
      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
      flexShrink: 0,
    }}>
      {/* Logo / project */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 28, height: 28, background: "#c9470a",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600,
        }}>35</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em" }}>
            35 PHILLIPS RD — Project Hub
          </div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
            color: "#8a8579", letterSpacing: "0.1em",
          }}>
            {PROJECT.city.toUpperCase()}
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* View toggle */}
      <div style={{
        display: "flex", border: "1px solid #3a3a3a", borderRadius: 2,
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.1em",
      }}>
        {["overview", "phase", "schedule", "renders", "plans"].map(v => (
          <button key={v} onClick={() => onViewChange(v)}
            style={{
              padding: "8px 14px", cursor: "pointer",
              background: view === v ? "#f5f2ec" : "transparent",
              color: view === v ? "#1a1a1a" : "#d4d0c5",
              border: "none", fontFamily: "inherit", fontSize: "inherit",
              letterSpacing: "inherit",
            }}>
            {v.toUpperCase()}
          </button>
        ))}
      </div>

      {/* GC access */}
      {editMode ? (
        <button onClick={onExitEdit} style={{
          padding: "7px 12px", background: "#c9470a", color: "#f5f2ec",
          border: "1px solid #c9470a",
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
          letterSpacing: "0.12em", cursor: "pointer",
        }}>
          EDIT MODE · EXIT
        </button>
      ) : (
        <button onClick={onSignIn} style={{
          padding: "7px 12px", background: "transparent", color: "#d4d0c5",
          border: "1px solid #3a3a3a",
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
          letterSpacing: "0.12em", cursor: "pointer",
        }}>
          GC SIGN IN
        </button>
      )}
    </div>
  );
}

function ScheduleView({ phases, progress, onSelect }) {
  const total = phases.reduce((s, p) => s + p.duration, 0);
  let cum = 0;
  const allMs = phases.flatMap(p => p.milestones || []);
  const doneFrac = allMs.length > 0 ? allMs.filter(m => m.done).length / allMs.length : 0;
  const playheadDays = doneFrac * total;

  return (
    <div className="schedule-root" style={{
      flex: 1, overflowY: "auto", background: "#f5f2ec", padding: "32px 40px",
      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    }}>
      <Label>Master schedule</Label>
      <h1 style={{
        margin: "6px 0 24px", fontSize: 32, fontWeight: 500, letterSpacing: "-0.02em",
      }}>Gantt — all phases</h1>

      <div style={{ background: "#fff", border: "1px solid rgba(26,26,26,0.12)", padding: 24 }}>
        {/* axis */}
        <div className="schedule-axis" style={{
          display: "grid", gridTemplateColumns: "180px 1fr 70px",
          gap: 16, paddingBottom: 10,
          borderBottom: "1px solid rgba(26,26,26,0.15)",
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
          color: "#8a8579", letterSpacing: "0.1em",
        }}>
          <div>PHASE</div>
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>JUL 1</span><span>JUL 22</span><span>AUG 12</span><span>SEP 2</span><span>SEP 14</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>DAYS</div>
        </div>

        {phases.map((p, i) => {
          const start = cum;
          cum += p.duration;
          const end = cum;
          const pct = (d) => (d / total) * 100;
          const status = statusFromMilestones(p);
          const colors = {
            complete: "#2d4a3e",
            "in-progress": "#c9470a",
            scheduled: "#1a1a1a",
            bidding: "#b8b2a3",
            queued: "#d9d3c3",
            blocked: "#b43a1a",
          };
          return (
            <div key={p.id} onClick={() => onSelect(p.id)} className="schedule-row" style={{
              display: "grid", gridTemplateColumns: "180px 1fr 70px",
              gap: 16, padding: "12px 0",
              borderBottom: "1px solid rgba(26,26,26,0.08)",
              cursor: "pointer", alignItems: "center",
            }}>
              <div>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
                  color: "#8a8579", letterSpacing: "0.1em",
                }}>PHASE {p.num}</div>
                <div className="phase-name" style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
              </div>
              <div style={{ position: "relative", height: 24 }}>
                <div style={{
                  position: "absolute", top: "50%", left: 0, right: 0, height: 1,
                  background: "rgba(26,26,26,0.08)", transform: "translateY(-0.5px)",
                }} />
                <div style={{
                  position: "absolute", top: 4, height: 16,
                  left: `${pct(start)}%`, width: `${pct(p.duration)}%`,
                  background: colors[status], display: "flex", alignItems: "center",
                  paddingLeft: 6,
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
                  color: status === "queued" || status === "bidding" ? "#1a1a1a" : "#f5f2ec",
                  letterSpacing: "0.08em", overflow: "hidden", whiteSpace: "nowrap",
                }}>{p.short.toUpperCase()}</div>
                {/* playhead */}
                <div style={{
                  position: "absolute", top: 0, bottom: 0,
                  left: `${pct(playheadDays)}%`, width: 2,
                  background: "#c9470a",
                }} />
              </div>
              <div style={{
                textAlign: "right", fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11, color: "#1a1a1a",
              }}>{p.duration}d</div>
            </div>
          );
        })}

        <div style={{
          marginTop: 16, display: "flex", gap: 18, flexWrap: "wrap",
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
          color: "#8a8579", letterSpacing: "0.08em",
        }}>
          {[
            ["COMPLETE", "#2d4a3e"],
            ["IN PROGRESS", "#c9470a"],
            ["SCHEDULED", "#1a1a1a"],
            ["BIDDING", "#b8b2a3"],
            ["QUEUED", "#d9d3c3"],
          ].map(([l, c]) => (
            <span key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 14, height: 8, background: c }} />
              {l}
            </span>
          ))}
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 2, height: 12, background: "#c9470a" }} />
            TODAY
          </span>
        </div>
      </div>
    </div>
  );
}

function OverviewView({ phases, progress, onSelect, persona, activity, onOpenRender }) {
  // Hero: current in-progress phase + next up
  let current = null, next = null;
  for (let i = 0; i < phases.length; i++) {
    const s = statusFromMilestones(phases[i]);
    if (s === "in-progress" && !current) current = { p: phases[i], i };
    else if ((s === "scheduled" || s === "bidding") && current && !next) next = { p: phases[i], i };
  }
  if (!current) {
    // Pick first non-complete as "up next"
    for (let i = 0; i < phases.length; i++) {
      if (statusFromMilestones(phases[i]) !== "complete") {
        current = { p: phases[i], i }; break;
      }
    }
  }
  if (!next && current) {
    for (let i = current.i + 1; i < phases.length; i++) {
      const s = statusFromMilestones(phases[i]);
      if (s !== "complete") { next = { p: phases[i], i }; break; }
    }
  }

  const completeCount = phases.filter(p =>
    statusFromMilestones(p) === "complete"
  ).length;

  return (
    <div className="overview-root" style={{
      flex: 1, overflowY: "auto", background: "#f5f2ec", padding: "32px 40px 40px",
      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    }}>
      <Label>Project overview</Label>
      <div className="overview-hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 6, marginBottom: 24 }}>
        <h1 className="overview-title" style={{ margin: 0, fontSize: 40, fontWeight: 500, letterSpacing: "-0.02em" }}>
          {PROJECT.address}
        </h1>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8a8579",
          textAlign: "right",
        }}>
          <div>START {PROJECT.started.toUpperCase()}</div>
          <div>TARGET C.O. {PROJECT.target.toUpperCase()}</div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="stats-grid" style={{
        display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
        border: "1px solid rgba(26,26,26,0.15)", background: "#fff",
        marginBottom: 24,
      }}>
        {[
          ["SQ FT ADDING", PROJECT.sqft.toLocaleString()],
          ["FLOORS", PROJECT.floors],
          ["BEDS", PROJECT.beds],
          ["BATHS", PROJECT.baths],
          ["PHASES DONE", `${completeCount} / ${phases.length}`],
        ].map(([k, v], i) => (
          <div key={k} style={{
            padding: "18px 20px",
            borderRight: i < 4 ? "1px solid rgba(26,26,26,0.12)" : "none",
          }}>
            <Label>{k}</Label>
            <div style={{ fontSize: 22, fontWeight: 500, marginTop: 6, letterSpacing: "-0.01em" }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Current + Next cards removed per owner preference */}

      {/* Project summary */}
      <section className="project-summary" style={{
        background: "#fff", border: "1px solid rgba(26,26,26,0.12)",
        padding: "28px 32px", marginBottom: 24,
      }}>
        <Label>Project summary</Label>
        <div style={{
          marginTop: 16,
          fontSize: 15, lineHeight: 1.6, color: "#1a1a1a",
        }}>
          <p style={{ margin: "0 0 14px" }}>
            We're opening up the existing ceilings and roofline to create a front-to-back cathedral.
            A new bay window anchors the entry, and the vaulted line runs the full depth of the
            house — extending past the chimney to carry the gesture through to the rear.
          </p>
          <p style={{ margin: "0 0 14px" }}>
            <strong style={{ fontWeight: 600 }}>HVAC</strong> is the critical tie-in. The house
            moves from one zone to two: Zone 1 (Bedrooms) gets a new air handler and condenser;
            Zone 2 (Living) gets a heat pump to supplement heat below 25°.
            Manual J, S, and D load calcs are scheduled.
          </p>
          <p style={{ margin: "0 0 14px" }}>
            <strong style={{ fontWeight: 600 }}>Electrical</strong> adds new high-hats throughout,
            interior and exterior accent lighting, a ceiling fan, a dining chandelier, and new
            circuits sized for the updated layout.
          </p>
          <p style={{ margin: "0 0 18px" }}>
            <strong style={{ fontWeight: 600 }}>Plumbing & gas</strong> converts the existing
            furnace to gas and runs lines stubbed for future renovation phases.
          </p>
          <p style={{
            margin: 0, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
            color: "#8a8579", letterSpacing: "0.08em",
          }}>
            CLICK ANY PHASE FROM THE MENU FOR SCOPE, MILESTONES, AND CONTRACTOR DETAILS.
          </p>
        </div>
      </section>

      {/* Renders */}
      <RendersSection onOpen={onOpenRender} />

    </div>
  );
}

function TweaksPanel({ active, onClose, state, setState, personas }) {
  if (!active) return null;
  return (
    <div className="tweaks-panel" style={{
      position: "fixed", right: 20, bottom: 20, width: 320,
      background: "#1a1a1a", color: "#f5f2ec",
      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
      boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      zIndex: 1000, border: "1px solid #2a2a2a",
    }}>
      <div style={{
        padding: "14px 18px", display: "flex", justifyContent: "space-between",
        alignItems: "center", borderBottom: "1px solid #2a2a2a",
      }}>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
          letterSpacing: "0.14em",
        }}>TWEAKS</div>
        <button onClick={onClose} style={{
          background: "transparent", border: "none", color: "#8a8579",
          cursor: "pointer", fontSize: 16,
        }}>×</button>
      </div>
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
            color: "#8a8579", letterSpacing: "0.12em", marginBottom: 8,
          }}>PROJECT PROGRESS — {Math.round(state.progress * 100)}%</div>
          <input type="range" min="0" max="100" value={state.progress * 100}
            onChange={(e) => setState({ ...state, progress: Number(e.target.value) / 100 })}
            style={{ width: "100%", accentColor: "#c9470a" }} />
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
            color: "#8a8579", marginTop: 4,
          }}>
            <span>START</span><span>DEMO</span><span>ROUGH</span><span>FINISH</span>
          </div>
        </div>

        <div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
            color: "#8a8579", letterSpacing: "0.12em", marginBottom: 8,
          }}>ACCENT</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["#c9470a", "#2d4a3e", "#1a4a7a", "#7a1a4a"].map(c => (
              <button key={c} onClick={() => setState({ ...state, accent: c })}
                style={{
                  width: 32, height: 32, background: c, border: state.accent === c ? "2px solid #f5f2ec" : "1px solid #3a3a3a",
                  cursor: "pointer",
                }} />
            ))}
          </div>
        </div>

        <div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
            color: "#8a8579", letterSpacing: "0.12em", marginBottom: 8,
          }}>DEFAULT VIEW</div>
          <div style={{ display: "flex", border: "1px solid #3a3a3a", flexWrap: "wrap" }}>
            {["overview", "phase", "schedule", "renders", "plans"].map(v => (
              <button key={v}
                onClick={() => setState({ ...state, view: v })}
                style={{
                  flex: 1, padding: "8px 4px", background: state.view === v ? "#f5f2ec" : "transparent",
                  color: state.view === v ? "#1a1a1a" : "#d4d0c5", border: "none",
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                  letterSpacing: "0.1em", cursor: "pointer",
                }}>{v.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TopBar, ScheduleView, OverviewView, TweaksPanel });