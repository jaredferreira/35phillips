// Tabs: Milestones / Material — Contractor / Material — Homeowner/GC
function PhaseChecklistTabs({ phase, status, editMode, onPatch, done, total }) {
  const [tab, setTab] = useState("milestones");

  // Reset to milestones whenever a different phase is selected
  useEffect(() => { setTab("milestones"); }, [phase.id]);

  const hideMaterialTabs = ["gasrun", "eval", "bids"].includes(phase.id);

  const allTabs = [
    { id: "milestones",         label: "Milestones",           field: "milestones",         addLabel: "ADD MILESTONE" },
    { id: "materialContractor", label: "Material — Contractor",field: "materialContractor", addLabel: "ADD ITEM" },
    { id: "materialHomeowner",  label: "Material — Homeowner/GC", field: "materialHomeowner", addLabel: "ADD ITEM" },
  ];
  const tabs = hideMaterialTabs ? allTabs.slice(0, 1) : allTabs;

  const activeId = tabs.find(t => t.id === tab) ? tab : "milestones";
  const active = tabs.find(t => t.id === activeId) || tabs[0];
  const list = phase[active.field] || [];
  const activeDone = list.filter(m => m.done).length;
  const countText = active.id === "milestones"
    ? `${done} / ${total} complete`
    : `${activeDone} / ${list.length} sourced`;

  return (
    <section>
      {/* Boxed tab strip */}
      <div style={{
        display: "flex", gap: 0, flexWrap: "wrap",
      }}>
        {tabs.map(t => {
          const isActive = t.id === tab;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: "12px 18px", cursor: "pointer",
                background: isActive ? "#fff" : "#ebe6db",
                border: "1px solid rgba(26,26,26,0.15)",
                borderRight: "none",
                borderBottom: isActive ? "1px solid #fff" : "1px solid rgba(26,26,26,0.15)",
                marginBottom: -1,
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
                letterSpacing: "0.1em",
                color: isActive ? "#1a1a1a" : "#8a8579",
                fontWeight: isActive ? 600 : 400,
                position: "relative",
                boxShadow: isActive ? "inset 0 2px 0 #c9470a" : "none",
              }}>
              {t.label.toUpperCase()}
            </button>
          );
        })}
        {/* filler to extend the bottom border of the inactive strip */}
        <div style={{
          flex: 1, minWidth: 10,
          borderBottom: "1px solid rgba(26,26,26,0.15)",
          borderRight: "1px solid rgba(26,26,26,0.15)",
        }}/>
      </div>

      {/* Tab panel */}
      <div style={{
        background: "#fff",
        border: "1px solid rgba(26,26,26,0.15)",
        borderTop: "none",
      }}>
        {/* Panel header — count + edit indicator */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 18px",
          borderBottom: "1px solid rgba(26,26,26,0.08)",
          background: "#faf8f3",
        }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
            letterSpacing: "0.12em", color: "#8a8579",
          }}>
            {active.label.toUpperCase()}
          </div>
          <div style={{
            display: "flex", gap: 12, alignItems: "center",
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
            color: "#1a1a1a", whiteSpace: "nowrap",
          }}>
            <span>{countText}</span>
            {editMode && <span style={{ color: "#c9470a" }}>· EDITABLE</span>}
          </div>
        </div>

        {/* List — rendered without its own outer border so it sits flush inside the panel */}
        <ChecklistList
          phase={phase}
          status={status}
          editMode={editMode}
          onPatch={onPatch}
          field={active.field}
          addLabel={active.addLabel}
        />
      </div>
    </section>
  );
}

// Phase detail — main content pane (with GC edit mode)

function PhaseDetail({ phase, phaseIndex, totalPhases, progress, activity, phases, persona, editMode, onPatch }) {
  const status = statusFromProgress(phaseIndex, totalPhases, progress);
  const milestones = milestonesForStatus(phase.milestones, status, progress, phaseIndex, totalPhases);
  const done = milestones.filter(m => m.done).length;
  const total = milestones.length;

  // Date math — fake but consistent
  const startDay = phases.slice(0, phaseIndex).reduce((s, p) => s + p.duration, 0);
  const endDay = startDay + phase.duration;
  const fmtDay = (d) => {
    const base = new Date(2026, 6, 1); // July 1, 2026
    base.setDate(base.getDate() + d);
    return base.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Milestone edits operate on the stored list (phase.milestones)
  // (handled inside MilestoneList via onPatch)

  return (
    <div style={{
      flex: 1, overflowY: "auto", background: "#f5f2ec",
      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    }}>
      {/* Prominent date strip */}
      <div className="phase-date-strip" style={{
        padding: "20px 40px 0",
        display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
      }}>
        <div style={{
          display: "flex", alignItems: "baseline", gap: 16,
          padding: "12px 18px",
          background: "#1a1a1a", color: "#f5f2ec",
        }}>
          <div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
              color: "#8a8579", letterSpacing: "0.15em",
            }}>START</div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 500,
              letterSpacing: "0.04em", marginTop: 2,
            }}>{fmtDay(startDay).toUpperCase()}</div>
          </div>
          <div style={{ color: "#8a8579", fontSize: 18 }}>→</div>
          <div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
              color: "#8a8579", letterSpacing: "0.15em",
            }}>END</div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 500,
              letterSpacing: "0.04em", marginTop: 2, color: "var(--accent, #c9470a)",
            }}>{fmtDay(endDay).toUpperCase()}</div>
          </div>
          <div style={{
            marginLeft: 12, paddingLeft: 16,
            borderLeft: "1px solid rgba(245,242,236,0.2)",
          }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
              color: "#8a8579", letterSpacing: "0.15em",
            }}>DURATION</div>
            {editMode ? (
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 2 }}>
                <input type="number" min="1" value={phase.duration}
                  onChange={e => onPatch({ duration: Number(e.target.value) || 1 })}
                  style={{
                    width: 50, background: "transparent",
                    border: "1px dashed rgba(245,242,236,0.4)", color: "#f5f2ec",
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, fontWeight: 500,
                    padding: "2px 4px", textAlign: "center", outline: "none",
                  }}/>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#d4d0c5",
                }}>DAYS</span>
              </div>
            ) : (
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, fontWeight: 500,
                marginTop: 2,
              }}>{phase.duration} DAYS</div>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="phase-header" style={{
        padding: "20px 40px 24px",
        borderBottom: "1px solid rgba(26,26,26,0.15)",
        background: "#f5f2ec",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
          <Label style={{ color: "#8a8579" }}>PHASE {phase.num} / {totalPhases}</Label>
          <StatusPill status={status} />
        </div>
        <h1 className="phase-title" style={{
          margin: 0, fontSize: 44, fontWeight: 500, letterSpacing: "-0.02em",
          color: "#1a1a1a", fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        }}>{phase.name}</h1>
        <div style={{
          marginTop: 10, fontSize: 15, color: "#3a3a3a", maxWidth: 720, lineHeight: 1.5,
        }}>
          {phase.notes}
        </div>
      </div>

      {/* Body */}
      <div style={{
        padding: "28px 40px 40px",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 320px",
        gap: 28,
      }}
      className="phase-detail-grid"
      >
        {/* LEFT column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28, minWidth: 0 }}>
          {/* Tabbed checklists: Milestones / Material — Contractor / Material — Homeowner/GC */}
          <PhaseChecklistTabs
            phase={phase}
            status={status}
            editMode={editMode}
            onPatch={onPatch}
            done={done}
            total={total}
          />
        </div>

        {/* RIGHT column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Contractor card */}
          <div style={{
            background: "#1a1a1a", color: "#f5f2ec", padding: 22,
          }}>
            <Label style={{ color: "#8a8579" }}>
              Assigned contractor{editMode && " — editable"}
            </Label>
            {editMode ? (
              <EditField value={phase.contractor} dark
                onChange={v => onPatch({ contractor: v })}
                style={{
                  fontSize: 20, fontWeight: 500, marginTop: 8,
                  letterSpacing: "-0.01em", color: "#f5f2ec",
                }}/>
            ) : (
              <div style={{
                fontSize: 20, fontWeight: 500, marginTop: 8, letterSpacing: "-0.01em",
              }}>{phase.contractor}</div>
            )}
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
              color: "#d4d0c5", marginTop: 4,
            }}>{phase.trade}</div>

            <div style={{ height: 1, background: "rgba(245,242,236,0.15)", margin: "18px 0" }} />

            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 14px", fontSize: 12 }}>
              <div style={{ color: "#8a8579", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.08em" }}>LEAD</div>
              {editMode ? (
                <EditField value={phase.lead} dark onChange={v => onPatch({ lead: v })}
                  style={{ fontSize: 12 }}/>
              ) : (
                <div>{phase.lead}</div>
              )}
              <div style={{ color: "#8a8579", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.08em" }}>PHONE</div>
              {editMode ? (
                <EditField value={phase.phone} dark mono onChange={v => onPatch({ phone: v })}
                  style={{ fontSize: 12 }}/>
              ) : (
                <div style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{phase.phone}</div>
              )}
              <div style={{ color: "#8a8579", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.08em" }}>LICENSE #</div>
              {editMode ? (
                <EditField value={phase.license || ""} placeholder="—" dark mono
                  onChange={v => onPatch({ license: v })}
                  style={{ fontSize: 12 }}/>
              ) : (
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: phase.license ? "#f5f2ec" : "#8a8579" }}>
                  {phase.license || "—"}
                </div>
              )}
            </div>
          </div>

          {/* Dependencies */}
          <div style={{
            background: "#fff", border: "1px solid rgba(26,26,26,0.12)", padding: 22,
          }}>
            <Label>Dependencies</Label>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              {phaseIndex > 0 && (
                <div style={{ fontSize: 12, display: "flex", gap: 8 }}>
                  <span style={{ color: "#8a8579", fontFamily: "'IBM Plex Mono', monospace" }}>AFTER</span>
                  <span>{phases[phaseIndex - 1].name}</span>
                </div>
              )}
              {phaseIndex < phases.length - 1 && (
                <div style={{ fontSize: 12, display: "flex", gap: 8 }}>
                  <span style={{ color: "#8a8579", fontFamily: "'IBM Plex Mono', monospace" }}>BEFORE</span>
                  <span>{phases[phaseIndex + 1].name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PhaseDetail });
