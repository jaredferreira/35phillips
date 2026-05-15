// Plans — embedded PDF viewer using PDF.js

function PDFViewer({ url }) {
  const [pdfDoc, setPdfDoc]         = React.useState(null);
  const [pageNum, setPageNum]       = React.useState(1);
  const [numPages, setNumPages]     = React.useState(0);
  const [scale, setScale]           = React.useState(1.0);
  const [loading, setLoading]       = React.useState(true);
  const [rendering, setRendering]   = React.useState(false);
  const [loadError, setLoadError]   = React.useState(null);
  const canvasRef     = React.useRef(null);
  const containerRef  = React.useRef(null);
  const renderTaskRef = React.useRef(null);

  // Load the PDF document
  React.useEffect(() => {
    const lib = window.pdfjsLib;
    if (!lib) { setLoadError("PDF.js not loaded"); setLoading(false); return; }
    lib.GlobalWorkerOptions.workerSrc =
      "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

    setLoading(true);
    setLoadError(null);
    lib.getDocument(url).promise
      .then(doc => { setPdfDoc(doc); setNumPages(doc.numPages); setLoading(false); })
      .catch(err => { setLoadError(err.message); setLoading(false); });
  }, [url]);

  // Render current page whenever pdf/page/scale changes
  React.useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    if (renderTaskRef.current) { renderTaskRef.current.cancel(); }
    setRendering(true);

    pdfDoc.getPage(pageNum).then(page => {
      const container = containerRef.current;
      const availW = container ? container.clientWidth - 32 : 800;
      const baseVp = page.getViewport({ scale: 1 });
      const fitScale = Math.min(availW / baseVp.width, 2.5);
      const viewport = page.getViewport({ scale: fitScale * scale });

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width  = viewport.width;
      canvas.height = viewport.height;

      const task = page.render({ canvasContext: canvas.getContext("2d"), viewport });
      renderTaskRef.current = task;
      task.promise
        .then(() => setRendering(false))
        .catch(err => { if (err.name !== "RenderingCancelledException") setRendering(false); });
    });
  }, [pdfDoc, pageNum, scale]);

  const prevPage = () => setPageNum(p => Math.max(1, p - 1));
  const nextPage = () => setPageNum(p => Math.min(numPages, p + 1));
  const zoomOut  = () => setScale(s => Math.max(0.5, parseFloat((s - 0.25).toFixed(2))));
  const zoomIn   = () => setScale(s => Math.min(3.0, parseFloat((s + 0.25).toFixed(2))));
  const zoomFit  = () => setScale(1.0);

  const btn = (onClick, label, disabled, accent) => (
    <button onClick={onClick} disabled={disabled} style={{
      background: "transparent",
      border: `1px solid ${accent ? "#c9470a" : "#3a3a3a"}`,
      color: accent ? "#c9470a" : disabled ? "#555" : "#f5f2ec",
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
      letterSpacing: "0.08em", padding: "6px 12px",
      cursor: disabled ? "default" : "pointer", whiteSpace: "nowrap",
    }}>{label}</button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>

      {/* ── Toolbar ── */}
      <div style={{
        background: "#1a1a1a", padding: "10px 16px", flexShrink: 0,
        display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        borderBottom: "2px solid #000",
      }}>
        {/* Page navigation */}
        {btn(prevPage, "← PREV", pageNum <= 1)}
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
          color: "#d4d0c5", minWidth: 72, textAlign: "center",
        }}>
          {loading ? "—" : `${pageNum} / ${numPages}`}
        </span>
        {btn(nextPage, "NEXT →", pageNum >= numPages)}

        <div style={{ width: 1, height: 20, background: "#3a3a3a", margin: "0 2px", flexShrink: 0 }} />

        {/* Zoom */}
        {btn(zoomOut, "−", scale <= 0.5)}
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
          color: "#d4d0c5", minWidth: 44, textAlign: "center",
        }}>{Math.round(scale * 100)}%</span>
        {btn(zoomIn, "+", scale >= 3.0)}
        {btn(zoomFit, "FIT", false, true)}

        <div style={{ flex: 1 }} />

        {/* Open full screen */}
        <a href={url} target="_blank" style={{
          background: "transparent", border: "1px solid #3a3a3a", color: "#f5f2ec",
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
          letterSpacing: "0.08em", padding: "6px 12px",
          textDecoration: "none", whiteSpace: "nowrap",
        }}>↗ FULL SCREEN</a>

        {/* Download */}
        <a href={url} download="35-phillips-plans.pdf" style={{
          background: "transparent", border: "1px solid #3a3a3a", color: "#f5f2ec",
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
          letterSpacing: "0.08em", padding: "6px 12px",
          textDecoration: "none", whiteSpace: "nowrap",
        }}>↓ DOWNLOAD</a>
      </div>

      {/* ── Canvas area ── */}
      {/* Outer: measures available width for fit-scale; never scrolls */}
      <div ref={containerRef} style={{
        flex: 1, overflow: "hidden", background: "#d9d3c3", minHeight: 0,
      }}>
        {/* Inner: scrolls in both axes when canvas is larger than the frame */}
        <div style={{
          width: "100%", height: "100%",
          overflowY: "auto", overflowX: "auto",
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: 16, boxSizing: "border-box",
        }}>
          {loading && (
            <div style={{
              margin: "auto", fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11, color: "#8a8579", letterSpacing: "0.12em", padding: 60,
            }}>LOADING PDF…</div>
          )}
          {loadError && (
            <div style={{
              margin: "auto", fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11, color: "#c9470a", padding: 40, textAlign: "center",
            }}>
              <div>COULD NOT LOAD PDF</div>
              <div style={{ marginTop: 8, color: "#8a8579" }}>{loadError}</div>
              <a href={url} target="_blank" style={{ color: "#c9470a", marginTop: 16, display: "block" }}>
                OPEN IN NEW TAB →
              </a>
            </div>
          )}
          <canvas ref={canvasRef} style={{
            display: loading || loadError ? "none" : "block",
            boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
            opacity: rendering ? 0.65 : 1,
            transition: "opacity 120ms",
            flexShrink: 0,
          }} />
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
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 24px 16px", background: "#f5f2ec",
        borderBottom: "1px solid rgba(26,26,26,0.12)", flexShrink: 0,
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        flexWrap: "wrap", gap: 8,
      }}>
        <div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
            letterSpacing: "0.14em", color: "#8a8579",
          }}>ARCHITECTURAL DRAWINGS</div>
          <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em" }}>
            Plans
          </h1>
        </div>
        <div className="page-subtitle" style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
          color: "#8a8579", textAlign: "right",
        }}>
          <div>CHARLES SCHAFFER & ASSOCIATES LLC</div>
        </div>
      </div>

      {/* PDF Viewer — fills remaining height */}
      <PDFViewer url="plans.pdf" />
    </div>
  );
}

Object.assign(window, { PlansView });
