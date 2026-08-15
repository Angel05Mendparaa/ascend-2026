import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ---------------------------------------------------------
   ASCEND — neutral / archival theme
   Concept: reconciling three sources' claims about one
   component is a provenance problem. Each component reads
   like an authentication record: a catalog number, a ledger
   of who claimed what, and a stamp — authenticated or disputed.
--------------------------------------------------------- */

const FONTS_HREF = "https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap";

const SOURCE_STYLE = {
  figma:    { label: 'Figma',    ink: '#7A4FB0', tint: '#F2EAFA', border: '#D9C4EF' },
  kamdhenu: { label: 'Kamdhenu', ink: '#A6752B', tint: '#F8EEDC', border: '#E8CFA0' },
  solace:   { label: 'SOLACE',   ink: '#1F7A6C', tint: '#E4F3EF', border: '#B7E0D5' },
  system:   { label: 'System',   ink: '#6B6A62', tint: '#EEEDE6', border: '#D8D6CC' },
};

const PAPER = '#EFEEE8';
const CARD = '#FFFFFF';
const BORDER = '#E1DFD5';
const BORDER_STRONG = '#CFCDC0';
const INK = '#1C1B18';
const INK_SOFT = '#6B6A62';
const INK_MUTED = '#9B9A90';
const AUTH_GREEN = '#2F7A4A';
const AUTH_GREEN_TINT = '#E8F3EA';
const DISPUTE_RED = '#B03A2E';
const DISPUTE_RED_TINT = '#FBEAE7';

function sourceStyle(source) {
  return SOURCE_STYLE[source] || SOURCE_STYLE.system;
}

function ProvenanceTag({ source }) {
  const s = sourceStyle(source);
  return (
    <span
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        fontWeight: 500,
        color: s.ink,
        background: s.tint,
        border: `1px solid ${s.border}`,
        padding: '3px 9px',
        borderRadius: 4,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  );
}

function StatusStamp({ disputed }) {
  const color = disputed ? DISPUTE_RED : AUTH_GREEN;
  const tint = disputed ? DISPUTE_RED_TINT : AUTH_GREEN_TINT;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        fontWeight: 600,
        color,
        background: tint,
        border: `1px solid ${color}33`,
        padding: '4px 11px',
        borderRadius: 20,
        letterSpacing: '0.01em',
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
      {disputed ? 'Disputed' : 'Authenticated'}
    </span>
  );
}

function Dashboard() {
  const [reconciledState, setReconciledState] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const response = await fetch('http://localhost:3001/state');
        const data = await response.json();
        setReconciledState(data.reconciledState || []);
        setAuditLog(data.auditLog || []);
      } catch (error) {
        console.error("Could not fetch state.", error);
      }
    };

    fetchState();
    const intervalId = setInterval(fetchState, 1500);
    return () => clearInterval(intervalId);
  }, []);

  const runSimulation = async () => {
    setIsSimulating(true);
    const fixtureEvents = [
      { source: "figma", componentId: "checkout-btn", timestamp: "2026-08-15T10:00:00Z", action: "create", data: { layout: "flex-start", color: "blue", text: "Checkout" } },
      { source: "figma", componentId: "checkout-btn", timestamp: "2026-08-15T10:00:00Z", action: "create", data: { layout: "flex-start", color: "blue", text: "Checkout" } },
      { source: "kamdhenu", componentId: "checkout-btn", timestamp: "2026-08-15T10:05:00Z", action: "update", data: { layout: "center" } },
      { source: "kamdhenu", componentId: "checkout-btn", timestamp: "2026-08-15T10:06:00Z", action: "update", data: { animation: "fade" } },
      { source: "solace", componentId: "checkout-btn", timestamp: "2026-08-15T10:07:00Z", action: "update", data: { animation: "spring" } },
      { source: "figma", componentId: "checkout-btn", timestamp: "2026-08-15T10:02:00Z", action: "update", data: { color: "indigo" } }
    ];

    try {
      await fetch('http://localhost:3001/reset', { method: 'POST' });
      for (const event of fixtureEvents) {
        await fetch('http://localhost:3001/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    } catch (err) {
      console.error("Simulation failed", err);
    }
    setIsSimulating(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: PAPER, color: INK, fontFamily: "'Inter', sans-serif" }}>
      <link href={FONTS_HREF} rel="stylesheet" />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '44px 32px 64px' }}>

        {/* Header */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 20,
            flexWrap: 'wrap',
            paddingBottom: 24,
            marginBottom: 32,
            borderBottom: `2px solid ${INK}`,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: INK_MUTED,
                margin: '0 0 8px',
              }}
            >
              Design system reconciliation · archival record
            </p>
            <h1
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 600,
                fontSize: 38,
                letterSpacing: '-0.01em',
                margin: 0,
                lineHeight: 1.05,
              }}
            >
              ASCEND
            </h1>
            <p style={{ color: INK_SOFT, fontSize: 14, margin: '8px 0 0', maxWidth: 480 }}>
              Provenance tracking across Figma, Kamdhenu and SOLACE — every component's
              claims, cross-referenced and authenticated.
            </p>
          </div>

          <button
            onClick={runSimulation}
            disabled={isSimulating}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13.5,
              fontWeight: 600,
              color: isSimulating ? INK_MUTED : '#FFFFFF',
              background: isSimulating ? BORDER : INK,
              border: `1px solid ${INK}`,
              borderRadius: 8,
              padding: '11px 20px',
              cursor: isSimulating ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: 10 }}>{isSimulating ? '●' : '▶'}</span>
            {isSimulating ? 'Reconciling streams\u2026' : 'Run edge case simulation'}
          </button>
        </header>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 28 }}>

          {/* Left: specimen records */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 18, margin: 0 }}>
                Component records
              </h2>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: INK_MUTED }}>
                {reconciledState.length} tracked
              </span>
            </div>

            {reconciledState.length === 0 ? (
              <div
                style={{
                  border: `1.5px dashed ${BORDER_STRONG}`,
                  borderRadius: 10,
                  padding: '56px 24px',
                  textAlign: 'center',
                  background: CARD,
                }}
              >
                <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 6px' }}>No records yet</p>
                <p style={{ fontSize: 13, color: INK_SOFT, margin: 0 }}>
                  Run the edge case simulation to ingest an event stream.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <AnimatePresence>
                  {reconciledState.map((comp) => {
                    const hasConflict = auditLog.some(log => log.componentId === comp.id && log.conflictDetected);
                    return (
                      <motion.div
                        key={comp.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          background: CARD,
                          border: `1px solid ${hasConflict ? DISPUTE_RED : BORDER}`,
                          borderRadius: 10,
                          padding: '20px 22px',
                        }}
                      >
                        {/* Card header: catalog number + stamp */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <span
                            style={{
                              fontFamily: "'IBM Plex Mono', monospace",
                              fontSize: 12.5,
                              color: INK_SOFT,
                              letterSpacing: '0.01em',
                            }}
                          >
                            No. {comp.id}
                          </span>
                          <StatusStamp disputed={hasConflict} />
                        </div>

                        {/* Rendered specimen */}
                        <div
                          style={{
                            background: '#FAFAF7',
                            border: `1px solid ${BORDER}`,
                            borderRadius: 8,
                            minHeight: 120,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: comp.state.layout === 'center' ? 'center' : 'flex-start',
                            padding: 24,
                            marginBottom: 16,
                          }}
                        >
                          <motion.div
                            layout
                            style={{
                              background: comp.state.color || '#333',
                              color: '#FFFFFF',
                              padding: '11px 20px',
                              borderRadius: 8,
                              fontSize: 14,
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                            }}
                          >
                            <span>{comp.state.text || 'Component'}</span>
                            {comp.state.animation && (
                              <span
                                style={{
                                  fontFamily: "'IBM Plex Mono', monospace",
                                  fontSize: 10,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.06em',
                                  background: 'rgba(255,255,255,0.22)',
                                  padding: '2px 7px',
                                  borderRadius: 4,
                                }}
                              >
                                {comp.state.animation}
                              </span>
                            )}
                          </motion.div>
                        </div>

                        {/* Ledger footer */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 12.5,
                            color: INK_SOFT,
                            borderTop: `1px solid ${BORDER}`,
                            paddingTop: 12,
                          }}
                        >
                          <span>
                            Layout <strong style={{ color: INK, fontWeight: 600 }}>{comp.state.layout || 'default'}</strong>
                            <span style={{ margin: '0 10px', color: INK_MUTED }}>·</span>
                            Color <strong style={{ color: INK, fontWeight: 600 }}>{comp.state.color || 'default'}</strong>
                          </span>
                          <span style={{ color: AUTH_GREEN, fontWeight: 500 }}>Engine verified</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* Right: provenance ledger / audit trail */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 18, margin: 0 }}>
                Provenance ledger
              </h2>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: INK_MUTED }}>
                {auditLog.length} entries
              </span>
            </div>

            <div
              style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                padding: '8px 0',
                maxHeight: 720,
                overflowY: 'auto',
              }}
            >
              {auditLog.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 6px' }}>Ledger is empty</p>
                  <p style={{ fontSize: 13, color: INK_SOFT, margin: 0 }}>
                    Entries appear here as events are reconciled.
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {auditLog.map((log, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25, delay: index * 0.03 }}
                      style={{
                        padding: '14px 22px',
                        borderBottom: index === auditLog.length - 1 ? 'none' : `1px solid ${BORDER}`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <ProvenanceTag source={log.inputs?.source} />
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: INK_SOFT }}>
                            {log.componentId}
                          </span>
                        </div>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: INK_MUTED }}>
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                        </span>
                      </div>

                      <p style={{ fontSize: 13.5, color: INK, margin: '0 0 8px', lineHeight: 1.5 }}>
                        {log.decision}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5 }}>
                        <span style={{ color: INK_MUTED }}>
                          Action <strong style={{ color: INK_SOFT, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500 }}>
                            {log.inputs?.action}
                          </strong>
                        </span>
                        <span
                          style={{
                            color: log.conflictDetected ? DISPUTE_RED : AUTH_GREEN,
                            fontWeight: 600,
                          }}
                        >
                          {log.conflictDetected ? 'Conflict flagged' : 'Clean reconcile'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;