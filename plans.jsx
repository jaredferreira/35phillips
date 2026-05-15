// Plans — embedded PDF viewer using PDF.js
// All pages render vertically; pinch-to-zoom on mobile

// Renders a single PDF page onto its own canvas
function PageCanvas({ pdfDoc, pageNum, scale, availW }) {
  const canvasRef     = React.useRef(null);
  const renderTaskRef = React.useRef(null);

  React.useEffect(() => {
    if (!pdfDoc || !canvasRef.current || availW <= 0) return;
    if (renderTaskRef.current) { renderTaskRef.current.cancel(); renderTaskRef.current = null; }

    pdfDoc.getPage(pageNum).then(page => {
      const baseVp   = page.getViewport({ scale: 1 });
      const fitScale = availW / baseVp.width;
      const viewport = page.getViewport({ scale: fitScale * scale });

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width  = viewport.width;
      canvas.height = viewport.height;

      const task = page.render({ canvasContext: canvas.getContext("2d"), viewport });
      renderTaskRef.current = task;
      task.promise.catch(err => {
        if (err.name !== "RenderingCancelledException") console.warn("render err", err);
      });
    });
  }, [pdfDoc, pageNum, scale, availW]);

  return (
    <canvas ref={canvasRef} style={{
      display: "block",
      margin: "0 auto 16px",
      boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
    }} />
  );
}

function PDFViewer({ url }) {
  const [pdfDoc,    setPdfDoc]    = React.useState(null);
  const [numPages,  setNumPages]  = React.useState(0);
  const [scale,     setScale]     = React.useState(1.0);
  const [availW,    setAvailW]    = React.useState(0);
  const [loading,   setLoading]   = React.useState(true);
  const [loadError, setLoadError] = React.useState(null);

  const outerRef   = React.useRef(null); // fixed frame — measures width
  const scrollRef  = React.useRef(null); // scrollable inner
  const scaleRef   = React.useRef(scale);
  React.useEffect(() => { scaleRef.current = scale; }, [scale]);

  // Load PDF
  React.useEffect(() => {
    const lib = window.pdfjsLib;
    if (!lib) { setLoadError("PDF.js not loaded"); setLoading(false); return; }
    lib.GlobalWorkerOptions.workerSrc =
      "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
    setLoading(true); setLoadError(null);
    lib.getDocument(url).promise
      .then(doc => { setPdfDoc(doc); setNumPages(doc.numPages); setLoading(false); })
      .catch(err => { setLoadError(err.message); setLoading(false); });
  }, [url]);

  // Measure container width (used by each PageCanvas for fit-scale)
  React.useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const measure = () => setAvailW(el.clientWidth - 32); // 16px padding each side
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Pinch-to-zoom (mobile)
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const pinch = { active: false, startDist: 0, startScale: 1 };

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinch.active     = true;
        pinch.startDist  = Math.hypot(dx, dy);
        pinch.startScale = scaleRef.current;
      } else {
        pinch.active = false;
      }
    };
    const onTouchMove = (e) => {
      if (!pinch.active || e.touches.length !== 2) return;
      e.preventDefault();
      const dx   = e.touches[0].clientX - e.touches[1].clientX;
      const dy   = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const next = Math.min(3.0, Math.max(0.5,
        parseFloat((pinch.startScale * (dist / pinch.startDist)).toFixed(2))
      ));
      setScale(next);
    };
    const onTouchEnd = () => { pinch.active = false; };

    el.addEventListener("touchstart",  onTouchStart, { passive: true });
    el.addEventListener("touchmove",   onTouchMove,  { passive: false });
    el.addEventListener("touchend",    onTouchEnd);
    return () => {
      el.removeEventListener("touchstart",  onTouchStart);
      el.removeEventListener("touchmove",   onTouchMove);
      el.removeEventListener("touchend",    onTouchEnd);
    };
  }, []);

  const zoomOut = () => setScale(s => Math.max(0.5, parseFloat((s - 0.25).toFixed(2))));
  const zoomIn  = () => setScale(s => Math.min(3.0, parseFloat((s + 0.25).toFixed(2))));
  const zoomFit = () => setScale(1.0);

  const btn = (onClick, label, disabled, accent) => (
    <button onClick={onClick} disabled={disabled} style={{
      background: "transparent",
      border: `1px solid ${accent ? "#c9470a" : "rgba(26,26,26,0.25)"}`,
      color: accent ? "#c9470a" : disabled ? "#b8b2a3" : "#3a3a3a",
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
      letterSpacing: "0.08em", padding: "6px 12px",
      cursor: disabled ? "default" : "pointer", whiteSpace: "nowrap",
    }}>{label}</button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, width: "100%", overflow: "hidden" }}>

      {/* ── Toolbar ── */}
      <div style={{
        background: "#f0ece3", padding: "10px 16px", flexShrink: 0,
        display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        borderBottom: "1px solid rgba(26,26,26,0.15)", overflow: "hidden", minWidth: 0,
      }}>
        {/* Zoom */}
        {btn(zoomOut, "−", scale <= 0.5)}
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
          color: "#6b6560", minWidth: 44, textAlign: "center",
        }}>{Math.round(scale * 100)}%</span>
        {btn(zoomIn, "+", scale >= 3.0)}
        {btn(zoomFit, "FIT", false, true)}

        <div style={{ flex: 1 }} />

        {/* Page count */}
        {!loading && !loadError && (
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
            color: "#6b6560", whiteSpace: "nowrap",
          }}>{numPages} PAGES</span>
        )}

        <div style={{ width: 1, height: 20, background: "rgba(26,26,26,0.15)", margin: "0 4px", flexShrink: 0 }} />

        {/* Open full screen */}
        <a href={url} target="_blank" style={{
          background: "transparent", border: "1px solid rgba(26,26,26,0.25)", color: "#3a3a3a",
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
          letterSpacing: "0.08em", padding: "6px 12px",
          textDecoration: "none", whiteSpace: "nowrap",
        }}>↗ FULL SCREEN</a>

        {/* Download */}
        <a href={url} download="35-phillips-plans.pdf" style={{
          background: "transparent", border: "1px solid rgba(26,26,26,0.25)", color: "#3a3a3a",
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
          letterSpacing: "0.08em", padding: "6px 12px",
          textDecoration: "none", whiteSpace: "nowrap",
        }}>↓ DOWNLOAD</a>
      </div>

      {/* ── Scroll area ── */}
      <div ref={outerRef} style={{ flex: 1, overflow: "hidden", background: "#d9d3c3", minHeight: 0 }}>
        <div ref={scrollRef} style={{
          width: "100%", height: "100%",
          overflowY: "auto", overflowX: "auto",
          padding: 16, boxSizing: "border-box",
        }}>
          {loading && (
            <div style={{
              textAlign: "center", padding: 60,
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
              color: "#8a8579", letterSpacing: "0.12em",
            }}>LOADING PDF…</div>
          )}
          {loadError && (
            <div style={{
              textAlign: "center", padding: 40,
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#c9470a",
            }}>
              <div>COULD NOT LOAD PDF</div>
              <div style={{ marginTop: 8, color: "#8a8579" }}>{loadError}</div>
              <a href={url} target="_blank" style={{ color: "#c9470a", marginTop: 16, display: "block" }}>
                OPEN IN NEW TAB →
              </a>
            </div>
          )}
          {!loading && !loadError && pdfDoc && availW > 0 &&
            Array.from({ length: numPages }, (_, i) => (
              <PageCanvas
                key={i}
                pdfDoc={pdfDoc}
                pageNum={i + 1}
                scale={scale}
                availW={availW}
              />
            ))
          }
        </div>
      </div>
    </div>
  );
}

function PlansView() {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", minHeight: 0,
      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
      overflow: "hidden", width: "100%", minWidth: 0,
    }}>
      <PDFViewer url="plans.pdf" />
    </div>
  );
}

Object.assign(window, { PlansView });
