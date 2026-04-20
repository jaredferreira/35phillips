// UI atoms for 35 Phillips hub

const StatusDot = ({ status }) => {
  const map = {
    complete:   { bg: "#2d4a3e", ring: "#2d4a3e" },
    "in-progress": { bg: "#c9470a", ring: "#c9470a" },
    scheduled:  { bg: "#f5f2ec", ring: "#1a1a1a" },
    bidding:    { bg: "#f5f2ec", ring: "#1a1a1a", dashed: true },
    queued:     { bg: "transparent", ring: "#b8b2a3" },
    blocked:    { bg: "#b43a1a", ring: "#b43a1a" },
  };
  const s = map[status] || map.queued;
  return (
    <span style={{
      display: "inline-block", width: 10, height: 10, borderRadius: "50%",
      background: s.bg, boxShadow: `inset 0 0 0 1.5px ${s.ring}`,
      borderStyle: s.dashed ? "dashed" : "solid",
    }} />
  );
};

const StatusPill = ({ status }) => {
  const labels = {
    complete: "COMPLETE",
    "in-progress": "IN PROGRESS",
    scheduled: "SCHEDULED",
    bidding: "BIDDING",
    queued: "QUEUED",
    blocked: "BLOCKED",
  };
  const colors = {
    complete:     { bg: "#2d4a3e", fg: "#f5f2ec" },
    "in-progress":{ bg: "#c9470a", fg: "#f5f2ec" },
    scheduled:    { bg: "#1a1a1a", fg: "#f5f2ec" },
    bidding:      { bg: "#f5f2ec", fg: "#1a1a1a", border: "#1a1a1a" },
    queued:       { bg: "transparent", fg: "#8a8579", border: "#b8b2a3" },
    blocked:      { bg: "#b43a1a", fg: "#f5f2ec" },
  };
  const c = colors[status] || colors.queued;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 8px", fontSize: 10, letterSpacing: "0.12em",
      fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500,
      background: c.bg, color: c.fg,
      border: c.border ? `1px solid ${c.border}` : "1px solid transparent",
      borderRadius: 2,
    }}>
      {labels[status] || status}
    </span>
  );
};

const Hairline = ({ v = false, style = {} }) => (
  <div style={{
    background: "#1a1a1a",
    ...(v ? { width: 1, alignSelf: "stretch" } : { height: 1, width: "100%" }),
    opacity: 0.15,
    ...style,
  }} />
);

const Label = ({ children, style = {} }) => (
  <div style={{
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#8a8579",
    ...style,
  }}>{children}</div>
);

// Compute phase status from progress (0..1)
function statusFromProgress(phaseIndex, totalPhases, progress, personaLock) {
  // Phases finish sequentially. Progress maps to a "playhead" across 0..totalPhases.
  const playhead = progress * totalPhases;
  const phaseStart = phaseIndex;
  const phaseEnd = phaseIndex + 1;
  if (playhead >= phaseEnd) return "complete";
  if (playhead > phaseStart) return "in-progress";
  // Not yet started
  if (phaseIndex - playhead < 1.2) return "scheduled";
  if (phaseIndex - playhead < 2.5) return "bidding";
  return "queued";
}

// Adjusted milestone completion based on phase status
function milestonesForStatus(baseMilestones, status, progress, phaseIndex, totalPhases) {
  if (status === "complete") return baseMilestones.map(m => ({ ...m, done: true }));
  if (status === "queued" || status === "bidding" || status === "scheduled") {
    return baseMilestones.map(m => ({ ...m, done: false }));
  }
  // in-progress: compute fraction within phase
  const playhead = progress * totalPhases;
  const frac = Math.max(0, Math.min(1, playhead - phaseIndex));
  const n = Math.floor(baseMilestones.length * frac);
  return baseMilestones.map((m, i) => ({ ...m, done: i < n }));
}

Object.assign(window, {
  StatusDot, StatusPill, Hairline, Label,
  statusFromProgress, milestonesForStatus,
});
