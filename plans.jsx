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
        {/* Page navigation */}
        {btn(prevPage, "← PREV", pageNum <= 1)}
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
          color: "#6b6560", minWidth: 72, textAlign: "center",
        }}>
          {loading ? "—" : `${pageNum} / ${numPages}`}
        </span>
        {btn(nextPage, "NEXT →", pageNum >= numPages)}

        <div style={{ width: 1, height: 20, background: "rgba(26,26,26,0.15)", margin: "0 2px", flexShrink: 0 }} />

        {/* Zoom */}
        {btn(zoomOut, "−", scale <= 0.5)}
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
          color: "#6b6560", minWidth: 44, textAlign: "center",
        }}>{Math.round(scale * 100)}%</span>
        {btn(zoomIn, "+", scale >= 3.0)}
        {btn(zoomFit, "FIT", false, true)}

        <div style={{ flex: 1 }} />

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

      {/* ── Canvas area ── */}
      {/* Outer: measures available width for fit-scale; never scrolls */}
      <div ref={containerRef} style={{
        flex: 1, overflow: "hidden", background: "#d9d3c3", minHeight: 0,
      }}>
        {/* Inner: scrolls in both axes when canvas is larger than the frame */}
        <div style={{
          width: "100%", height: "100%",
          overflowY: "auto", overflowX: "auto",
          padding: 16, boxSizing: "border-box",
        }}>
          {loading && (
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11, color: "#8a8579", letterSpacing: "0.12em", padding: 60,
              textAlign: "center",
            }}>LOADING PDF…</div>
          )}
          {loadError && (
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
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
            margin: "0 auto",
            boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
            opacity: rendering ? 0.65 : 1,
            transition: "opacity 120ms",
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
      overflow: "hidden", width: "100%", minWidth: 0,
    }}>
      <PDFViewer url="plans.pdf" />
    </div>
  );
}

Object.assign(window, { PlansView });
