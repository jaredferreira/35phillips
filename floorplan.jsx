// Floor plan — abstract top-down diagram of the house
// Highlights rooms that belong to the selected phase's areas

function FloorPlan({ phase, progress, phases }) {
  // Map areas to room keys
  const areaSet = new Set((phase.areas || []).join(" ").toLowerCase());
  const has = (key) => (phase.areas || []).some(a => a.toLowerCase().includes(key));

  const rooms = [
    // 1st floor
    { id: "kit",    floor: 1, label: "Kitchen",       x: 40,  y: 40,  w: 160, h: 110, active: has("kitchen") },
    { id: "din",    floor: 1, label: "Dining",        x: 40,  y: 150, w: 160, h: 90,  active: has("dining") },
    { id: "liv",    floor: 1, label: "Living",        x: 200, y: 40,  w: 170, h: 140, active: false },
    { id: "bath1",  floor: 1, label: "Bath 1",        x: 200, y: 180, w: 80,  h: 60,  active: has("1st-floor bath") || has("bath") },
    { id: "mud",    floor: 1, label: "Mud",           x: 280, y: 180, w: 90,  h: 60,  active: false },
    { id: "porch",  floor: 1, label: "Porch",         x: 40,  y: 240, w: 330, h: 40,  active: has("porch") || has("front steps") },
  ];
  const rooms2 = [
    { id: "pbed",   floor: 2, label: "Primary Bed",   x: 40,  y: 40,  w: 200, h: 120, active: has("primary") },
    { id: "pbath",  floor: 2, label: "Primary Bath",  x: 240, y: 40,  w: 130, h: 80,  active: has("primary bath") || has("bath") },
    { id: "wic",    floor: 2, label: "WIC",           x: 240, y: 120, w: 130, h: 40,  active: has("primary") },
    { id: "bed2",   floor: 2, label: "Bed 2",         x: 40,  y: 160, w: 120, h: 100, active: false },
    { id: "bed3",   floor: 2, label: "Bed 3",         x: 160, y: 160, w: 120, h: 100, active: false },
    { id: "bath2",  floor: 2, label: "Bath 2",        x: 280, y: 160, w: 90,  h: 100, active: has("bath") },
  ];
  const roof = [
    { id: "main",   floor: 3, label: "Main Roof",     x: 40,  y: 40,  w: 260, h: 180, active: has("main roof") || has("roof deck") || has("roof") },
    { id: "dormer", floor: 3, label: "Rear Dormer",   x: 300, y: 40,  w: 70,  h: 110, active: has("dormer") },
    { id: "pr",     floor: 3, label: "Porch Roof",    x: 300, y: 150, w: 70,  h: 70,  active: has("porch roof") },
  ];

  const isGlobal = (phase.areas || []).some(a => /whole|all|envelope|exterior|rim/i.test(a));

  const Plate = ({ title, list, floorNum }) => (
    <div style={{
      flex: 1, minWidth: 0,
      background: "#f5f2ec",
      border: "1px solid rgba(26,26,26,0.15)",
    }}>
      <div style={{
        padding: "10px 14px", borderBottom: "1px solid rgba(26,26,26,0.15)",
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
      }}>
        <Label>{title}</Label>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#8a8579",
        }}>FL-0{floorNum}</div>
      </div>
      <div style={{ padding: 12 }}>
        <svg viewBox="0 0 410 300" style={{ width: "100%", display: "block" }}>
          {/* hatching pattern for active */}
          <defs>
            <pattern id={`hatch-${floorNum}`} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#c9470a" strokeWidth="2"/>
            </pattern>
            <pattern id={`hatch-global-${floorNum}`} patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#c9470a" strokeWidth="1" opacity="0.4"/>
            </pattern>
          </defs>

          {/* outer house outline */}
          <rect x="30" y="30" width="355" height="260" fill="none" stroke="#1a1a1a" strokeWidth="1.5"/>

          {isGlobal && (
            <rect x="30" y="30" width="355" height="260" fill={`url(#hatch-global-${floorNum})`}/>
          )}

          {list.map(r => (
            <g key={r.id}>
              <rect
                x={r.x} y={r.y} width={r.w} height={r.h}
                fill={r.active ? `url(#hatch-${floorNum})` : "transparent"}
                stroke="#1a1a1a" strokeWidth={r.active ? 1.5 : 0.5}
                opacity={r.active ? 1 : 0.8}
              />
              {r.active && (
                <rect
                  x={r.x} y={r.y} width={r.w} height={r.h}
                  fill="rgba(201,71,10,0.08)"
                  stroke="#c9470a" strokeWidth="1.5"
                />
              )}
              <text
                x={r.x + 6} y={r.y + 14}
                fontFamily="'IBM Plex Mono', monospace"
                fontSize="9"
                fill={r.active ? "#c9470a" : "#8a8579"}
                fontWeight={r.active ? 600 : 400}
                style={{ letterSpacing: "0.05em", textTransform: "uppercase" }}
              >
                {r.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
        <Label>Area assignment</Label>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#8a8579",
        }}>
          <span style={{ display: "inline-block", width: 10, height: 10, background: "#c9470a", marginRight: 6, verticalAlign: "middle" }} />
          ZONES FOR {phase.short.toUpperCase()}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <Plate title="First Floor"  list={rooms}  floorNum={1} />
        <Plate title="Second Floor" list={rooms2} floorNum={2} />
        <Plate title="Roof Plan"    list={roof}   floorNum={3} />
      </div>
    </div>
  );
}

Object.assign(window, { FloorPlan });
