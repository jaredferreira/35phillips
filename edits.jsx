// Edit-mode overlay: PIN auth + localStorage-backed phase edits
// Merges user edits over window.PHASES without touching data.js source.

window.GC_PIN = "1987";
const EDITS_KEY = "35phillips:edits";

// Load overlay from localStorage (shape: { [phaseId]: { contractor, lead, phone, milestones } })
function loadEdits() {
  try { return JSON.parse(localStorage.getItem(EDITS_KEY) || "{}"); }
  catch { return {}; }
}
function saveEdits(e) { localStorage.setItem(EDITS_KEY, JSON.stringify(e)); }

// Apply overlay to a phase (pure, returns new object)
function applyEdits(phase, edits) {
  const e = edits[phase.id];
  if (!e) return phase;
  return {
    ...phase,
    ...(e.contractor !== undefined ? { contractor: e.contractor } : {}),
    ...(e.lead !== undefined ? { lead: e.lead } : {}),
    ...(e.phone !== undefined ? { phone: e.phone } : {}),
    ...(e.duration !== undefined ? { duration: e.duration } : {}),
    ...(e.milestones !== undefined ? { milestones: e.milestones } : {}),
    ...(e.materialContractor !== undefined ? { materialContractor: e.materialContractor } : {}),
    ...(e.materialHomeowner !== undefined ? { materialHomeowner: e.materialHomeowner } : {}),
  };
}

// Apply to full array
function applyEditsAll(phases, edits) {
  return phases.map(p => applyEdits(p, edits));
}

// ─── PIN Modal ────────────────────────────────────────────────────
function PinModal({ open, onClose, onSuccess }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  useEffect(() => { if (open) { setPin(""); setErr(false); } }, [open]);
  if (!open) return null;
  const submit = () => {
    if (pin === window.GC_PIN) {
      sessionStorage.setItem("35phillips:gc", "1");
      onSuccess();
    } else {
      setErr(true);
    }
  };
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15,15,15,0.7)",
      zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#f5f2ec", padding: 32, width: 340,
        border: "1px solid #1a1a1a",
      }}>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
          letterSpacing: "0.15em", color: "#8a8579",
        }}>GC ACCESS</div>
        <div style={{ fontSize: 22, fontWeight: 500, marginTop: 4, letterSpacing: "-0.01em" }}>
          Enter PIN
        </div>
        <input
          type="password" value={pin} autoFocus
          onChange={e => { setPin(e.target.value); setErr(false); }}
          onKeyDown={e => e.key === "Enter" && submit()}
          style={{
            marginTop: 20, width: "100%", padding: "12px 14px",
            border: `1px solid ${err ? "#c9470a" : "#1a1a1a"}`,
            background: "#fff", fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 18, letterSpacing: "0.4em", textAlign: "center",
            outline: "none", boxSizing: "border-box",
          }}
          placeholder="••••"
        />
        {err && (
          <div style={{
            marginTop: 8, color: "#c9470a",
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
          }}>Incorrect PIN</div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "10px", background: "transparent",
            border: "1px solid #1a1a1a", color: "#1a1a1a",
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
            letterSpacing: "0.12em", cursor: "pointer",
          }}>CANCEL</button>
          <button onClick={submit} style={{
            flex: 1, padding: "10px", background: "#1a1a1a",
            border: "1px solid #1a1a1a", color: "#f5f2ec",
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
            letterSpacing: "0.12em", cursor: "pointer",
          }}>UNLOCK</button>
        </div>
      </div>
    </div>
  );
}

// ─── Editable text field ──────────────────────────────────────────
function EditField({ value, onChange, style, mono, dark, placeholder }) {
  return (
    <input
      value={value || ""}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={{
        background: "transparent",
        border: "none",
        borderBottom: `1px dashed ${dark ? "rgba(245,242,236,0.4)" : "rgba(26,26,26,0.35)"}`,
        color: "inherit", padding: "2px 0",
        fontFamily: mono ? "'IBM Plex Mono', monospace" : "inherit",
        fontSize: "inherit", fontWeight: "inherit", letterSpacing: "inherit",
        outline: "none", width: "100%", boxSizing: "border-box",
        ...style,
      }}
    />
  );
}

Object.assign(window, {
  loadEdits, saveEdits, applyEdits, applyEditsAll,
  PinModal, EditField,
});
