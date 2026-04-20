// Milestone list with accordion details + drag-to-reorder (edit mode)

function MilestoneRow({
  m, i, total, nextIdx, status, editMode,
  expanded, onToggleExpand,
  onToggleDone, onEditLabel, onEditDetails, onDelete,
  // drag
  draggingIdx, setDraggingIdx, onReorder,
}) {
  const isDragging = draggingIdx === i;
  const dragProps = editMode ? {
    draggable: true,
    onDragStart: (e) => {
      setDraggingIdx(i);
      e.dataTransfer.effectAllowed = "move";
      // hide ghost on Chrome for a cleaner drag (use the row itself)
      try { e.dataTransfer.setData("text/plain", String(i)); } catch {}
    },
    onDragEnd: () => setDraggingIdx(null),
    onDragOver: (e) => {
      if (draggingIdx == null || draggingIdx === i) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    onDrop: (e) => {
      e.preventDefault();
      if (draggingIdx == null || draggingIdx === i) return;
      onReorder(draggingIdx, i);
      setDraggingIdx(null);
    },
  } : {};

  const hasDetails = m.details && m.details.trim().length > 0;
  const caretRot = expanded ? 90 : 0;

  return (
    <div
      {...dragProps}
      style={{
        borderBottom: i < total - 1 ? "1px solid rgba(26,26,26,0.08)" : "none",
        background: isDragging ? "#f5f2ec" : "#fff",
        opacity: isDragging ? 0.55 : 1,
        transition: "opacity 120ms",
      }}
    >
      {/* Header row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: editMode
          ? "18px 22px 1fr 60px 20px 24px"     // handle, check, label, tag, caret, delete
          : "22px 1fr 60px 20px",               // check, label, tag, caret
        gap: 14, padding: "14px 18px",
        alignItems: "center",
        cursor: "default",
      }}>
        {editMode && (
          <div
            title="Drag to reorder"
            style={{
              color: "#b8b2a3", cursor: "grab", userSelect: "none",
              fontSize: 14, lineHeight: 1, textAlign: "center",
            }}>⋮⋮</div>
        )}
        <button
          onClick={onToggleDone}
          style={{
            width: 18, height: 18, padding: 0,
            border: `1.5px solid ${m.done ? "#2d4a3e" : "#b8b2a3"}`,
            background: m.done ? "#2d4a3e" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}>
          {m.done && (
            <svg width="11" height="11" viewBox="0 0 11 11">
              <polyline points="2,5.5 4.5,8 9,3" fill="none" stroke="#f5f2ec" strokeWidth="1.8"/>
            </svg>
          )}
        </button>
        {editMode ? (
          <EditField value={m.label} onChange={onEditLabel}
            style={{ fontSize: 14, color: m.done ? "#8a8579" : "#1a1a1a" }}/>
        ) : (
          <button
            onClick={onToggleExpand}
            style={{
              textAlign: "left", background: "transparent", border: "none",
              padding: 0, cursor: "pointer",
              fontSize: 14, color: m.done ? "#8a8579" : "#1a1a1a",
              textDecoration: m.done ? "line-through" : "none",
              fontFamily: "inherit",
            }}>
            {m.label}
            {hasDetails && (
              <span style={{
                marginLeft: 8, fontSize: 10, color: "#8a8579",
                fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.08em",
              }}>· DETAILS</span>
            )}
          </button>
        )}
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
          color: "#8a8579", letterSpacing: "0.08em", textAlign: "right",
        }}>
          {m.done ? "DONE" : (i === nextIdx && status === "in-progress") ? "NEXT" : "—"}
        </div>
        <button
          onClick={onToggleExpand}
          title={expanded ? "Collapse" : "Expand"}
          style={{
            width: 20, height: 20, padding: 0, border: "none",
            background: "transparent", cursor: "pointer",
            color: "#8a8579", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
          <svg width="10" height="10" viewBox="0 0 10 10" style={{
            transform: `rotate(${caretRot}deg)`, transition: "transform 150ms",
          }}>
            <polyline points="3,2 7,5 3,8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </button>
        {editMode && (
          <button onClick={onDelete} style={{
            width: 24, height: 24, border: "1px solid rgba(26,26,26,0.15)",
            background: "transparent", cursor: "pointer", padding: 0,
            color: "#8a8579", fontSize: 14, lineHeight: 1,
          }} title="Delete milestone">✕</button>
        )}
      </div>

      {/* Details panel */}
      {expanded && (
        <div style={{
          padding: "0 18px 16px",
          paddingLeft: editMode ? 58 : 54,
          borderTop: "1px dashed rgba(26,26,26,0.08)",
          paddingTop: 14, marginTop: -1,
          background: "#faf8f3",
        }}>
          {editMode ? (
            <textarea
              value={m.details || ""}
              onChange={e => onEditDetails(e.target.value)}
              placeholder="Add notes, sub-tasks, specs, open questions…"
              rows={4}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "#fff",
                border: "1px dashed rgba(26,26,26,0.3)",
                padding: "10px 12px",
                fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                fontSize: 13, lineHeight: 1.5, color: "#1a1a1a",
                resize: "vertical", outline: "none",
              }}/>
          ) : (
            <div style={{
              fontSize: 13, lineHeight: 1.55, color: "#3a3a3a",
              whiteSpace: "pre-wrap",
            }}>
              {hasDetails
                ? m.details
                : <span style={{ color: "#8a8579", fontStyle: "italic" }}>No details yet.</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Generic checklist — driven by a field name on the phase (milestones, materialContractor, materialHomeowner)
function ChecklistList({ phase, status, editMode, onPatch, field, addLabel }) {
  const [expanded, setExpanded] = useState({}); // { [index]: bool }
  const [draggingIdx, setDraggingIdx] = useState(null);

  const list = phase[field] || [];
  const nextIdx = list.findIndex(x => !x.done);

  const patch = (next) => onPatch({ [field]: next });
  const toggleExpand = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));
  const toggleDone = (i) => patch(list.map((m, idx) => idx === i ? { ...m, done: !m.done } : m));
  const editLabel = (i, label) => patch(list.map((m, idx) => idx === i ? { ...m, label } : m));
  const editDetails = (i, details) => patch(list.map((m, idx) => idx === i ? { ...m, details } : m));
  const del = (i) => {
    patch(list.filter((_, idx) => idx !== i));
    setExpanded(prev => { const n = { ...prev }; delete n[i]; return n; });
  };
  const add = () => {
    patch([...list, { label: "New item", done: false, details: "" }]);
    setExpanded(prev => ({ ...prev, [list.length]: true }));
  };
  const reorder = (from, to) => {
    if (from === to) return;
    const next = list.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    patch(next);
    // Remap expanded state indices
    setExpanded(prev => {
      const out = {};
      for (const [k, v] of Object.entries(prev)) {
        if (!v) continue;
        let idx = Number(k);
        if (idx === from) idx = to;
        else if (from < to && idx > from && idx <= to) idx -= 1;
        else if (from > to && idx >= to && idx < from) idx += 1;
        out[idx] = true;
      }
      return out;
    });
  };

  return (
    <div style={{ background: "#fff" }}>
      {list.map((m, i) => (
        <MilestoneRow
          key={i}
          m={m} i={i} total={list.length} nextIdx={nextIdx} status={status}
          editMode={editMode}
          expanded={!!expanded[i]}
          onToggleExpand={() => toggleExpand(i)}
          onToggleDone={() => toggleDone(i)}
          onEditLabel={(v) => editLabel(i, v)}
          onEditDetails={(v) => editDetails(i, v)}
          onDelete={() => del(i)}
          draggingIdx={draggingIdx} setDraggingIdx={setDraggingIdx}
          onReorder={reorder}
        />
      ))}
      {list.length === 0 && !editMode && (
        <div style={{
          padding: "24px 18px", textAlign: "center",
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
          color: "#8a8579", letterSpacing: "0.08em",
        }}>— NO ITEMS YET —</div>
      )}
      {editMode && (
        <button onClick={add} style={{
          width: "100%", padding: "14px 18px", textAlign: "left",
          background: "#f5f2ec", border: "none",
          borderTop: list.length > 0 ? "1px solid rgba(26,26,26,0.08)" : "none",
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
          letterSpacing: "0.1em", color: "#c9470a", cursor: "pointer",
        }}>+ {addLabel || "ADD ITEM"}</button>
      )}
    </div>
  );
}

// Legacy alias — milestones is just a ChecklistList against the "milestones" field
function MilestoneList({ phase, status, editMode, onPatch }) {
  return (
    <ChecklistList phase={phase} status={status} editMode={editMode}
      onPatch={onPatch} field="milestones" addLabel="ADD MILESTONE" />
  );
}

Object.assign(window, { MilestoneList, ChecklistList });
