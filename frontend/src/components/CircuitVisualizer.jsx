import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, AlertOctagon } from 'lucide-react';

// IEEE Std 91 Digital Logic Gate SVG Component
function GateSymbol({ type, label, isSelected, onClick }) {
  const strokeColor = isSelected ? '#38bdf8' : '#94a3b8';
  const fillColor = isSelected ? 'rgba(56, 189, 248, 0.2)' : '#1e293b';
  const strokeWidth = isSelected ? 2.5 : 2;

  const renderShape = () => {
    switch (type) {
      case 'AND':
        return (
          <g>
            <path
              d="M 10,5 L 32,5 A 20,20 0 0 1 32,45 L 10,45 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <line x1="0" y1="15" x2="10" y2="15" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="35" x2="10" y2="35" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="52" y1="25" x2="65" y2="25" stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );
      case 'NAND':
        return (
          <g>
            <path
              d="M 10,5 L 30,5 A 20,20 0 0 1 30,45 L 10,45 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <circle cx="54" cy="25" r="4" fill="#080c14" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="15" x2="10" y2="15" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="35" x2="10" y2="35" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="58" y1="25" x2="68" y2="25" stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );
      case 'OR':
        return (
          <g>
            <path
              d="M 8,5 Q 22,25 8,45 Q 32,45 52,25 Q 32,5 8,5 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <line x1="0" y1="15" x2="13" y2="15" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="35" x2="13" y2="35" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="52" y1="25" x2="65" y2="25" stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );
      case 'NOR':
        return (
          <g>
            <path
              d="M 8,5 Q 20,25 8,45 Q 30,45 48,25 Q 30,5 8,5 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <circle cx="52" cy="25" r="4" fill="#080c14" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="15" x2="12" y2="15" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="35" x2="12" y2="35" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="56" y1="25" x2="66" y2="25" stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );
      case 'XOR':
        return (
          <g>
            <path
              d="M 2,5 Q 16,25 2,45"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <path
              d="M 9,5 Q 23,25 9,45 Q 33,45 53,25 Q 33,5 9,5 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <line x1="0" y1="15" x2="7" y2="15" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="35" x2="7" y2="35" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="53" y1="25" x2="66" y2="25" stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );
      case 'XNOR':
        return (
          <g>
            <path
              d="M 2,5 Q 16,25 2,45"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <path
              d="M 9,5 Q 21,25 9,45 Q 31,45 49,25 Q 31,5 9,5 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <circle cx="53" cy="25" r="4" fill="#080c14" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="15" x2="7" y2="15" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="35" x2="7" y2="35" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="57" y1="25" x2="67" y2="25" stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );
      case 'NOT':
        return (
          <g>
            <path
              d="M 10,8 L 42,25 L 10,42 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <circle cx="46" cy="25" r="4" fill="#080c14" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="25" x2="10" y2="25" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="50" y1="25" x2="62" y2="25" stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );
      case 'INPUT':
        return (
          <g>
            <rect x="0" y="8" width="50" height="24" rx="4" fill="#0369a1" stroke="#38bdf8" strokeWidth={strokeWidth} />
            <text x="25" y="24" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="var(--font-mono)">
              {label}
            </text>
            <line x1="50" y1="20" x2="62" y2="20" stroke="#38bdf8" strokeWidth={strokeWidth} />
          </g>
        );
      case 'OUTPUT':
        return (
          <g>
            <line x1="0" y1="20" x2="12" y2="20" stroke="#4ade80" strokeWidth={strokeWidth} />
            <rect x="12" y="8" width="50" height="24" rx="4" fill="#15803d" stroke="#4ade80" strokeWidth={strokeWidth} />
            <text x="37" y="24" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="var(--font-mono)">
              {label}
            </text>
          </g>
        );
      case 'CONSTANT':
        return (
          <g>
            <rect x="0" y="8" width="30" height="24" rx="4" fill="#854d0e" stroke="#facc15" strokeWidth={strokeWidth} />
            <text x="15" y="24" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="var(--font-mono)">
              {label}
            </text>
            <line x1="30" y1="20" x2="45" y2="20" stroke="#facc15" strokeWidth={strokeWidth} />
          </g>
        );
      default: // WIRE or unhandled
        return (
          <g>
            <rect x="0" y="8" width="45" height="24" rx="4" fill="#4c1d95" stroke="#c084fc" strokeWidth={strokeWidth} />
            <text x="22" y="24" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="var(--font-mono)">
              {label}
            </text>
            <line x1="45" y1="20" x2="58" y2="20" stroke="#c084fc" strokeWidth={strokeWidth} />
          </g>
        );
    }
  };

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {renderShape()}
      {/* Label under gate */}
      {type !== 'INPUT' && type !== 'OUTPUT' && type !== 'CONSTANT' && (
        <text
          x="30"
          y="58"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="10"
          fontWeight="600"
          fontFamily="var(--font-mono)"
        >
          {label || type}
        </text>
      )}
    </g>
  );
}

export default function CircuitVisualizer({ circuit, title, compilationFailed, errorMessage }) {
  const [selectedGate, setSelectedGate] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // 1. Error state: If compilation failed or circuit is null, render clean Error / Empty state
  if (compilationFailed || !circuit || !circuit.gates || circuit.gates.length === 0) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#080c14',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-muted)'
      }}>
        {compilationFailed ? (
          <div style={{
            background: 'rgba(248, 113, 113, 0.1)',
            border: '1px solid rgba(248, 113, 113, 0.3)',
            borderRadius: '10px',
            padding: '2rem',
            maxWidth: '500px'
          }}>
            <AlertOctagon size={40} color="var(--accent-red)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--accent-red)', marginBottom: '0.5rem', fontWeight: 700 }}>
              Compilation Failed
            </h3>
            <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {errorMessage || 'Circuit generation skipped due to compiler errors.'}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-red)', fontFamily: 'var(--font-mono)' }}>
              NO CIRCUIT STRUCTURE GENERATED
            </span>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '1rem', fontStyle: 'italic' }}>
              No active circuit graph. Edit code and click <strong>Compile Circuit</strong>.
            </p>
          </div>
        )}
      </div>
    );
  }

  // 2. Dynamic Topological Auto-Layout
  const depthGroups = {};
  circuit.gates.forEach((gate) => {
    const d = gate.depth || 0;
    if (!depthGroups[d]) depthGroups[d] = [];
    depthGroups[d].push(gate);
  });

  const columnWidth = 220;
  const rowHeight = 100;

  // Calculate dynamic node positions & pin endpoints
  const gatePositions = {};
  Object.keys(depthGroups).sort((a, b) => parseInt(a, 10) - parseInt(b, 10)).forEach((depthStr) => {
    const depth = parseInt(depthStr, 10);
    const gatesInDepth = depthGroups[depth];

    gatesInDepth.forEach((gate, idx) => {
      const x = depth * columnWidth + 80;
      const y = idx * rowHeight + 60;

      // Pin coordinates for wire connections
      let inPin0 = { x: x, y: y + 15 };
      let inPin1 = { x: x, y: y + 35 };
      let outPin = { x: x + 65, y: y + 25 };

      if (gate.type === 'INPUT') {
        outPin = { x: x + 62, y: y + 20 };
      } else if (gate.type === 'OUTPUT') {
        inPin0 = { x: x, y: y + 20 };
        outPin = { x: x + 62, y: y + 20 };
      } else if (gate.type === 'NOT') {
        inPin0 = { x: x, y: y + 25 };
        outPin = { x: x + 62, y: y + 25 };
      } else if (gate.type === 'CONSTANT') {
        outPin = { x: x + 45, y: y + 20 };
      } else if (gate.type === 'NAND' || gate.type === 'NOR' || gate.type === 'XNOR') {
        outPin = { x: x + 68, y: y + 25 };
      }

      gatePositions[gate.id] = { x, y, inPin0, inPin1, outPin, gate };
    });
  });

  // Handle pan dragging
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.tagName === 'g') {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
        background: '#080c14',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Visualizer Toolbar */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(30, 41, 59, 0.9)',
        backdropFilter: 'blur(8px)',
        padding: '0.4rem 0.8rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)'
      }}>
        <span style={{ fontWeight: '600', fontSize: '0.85rem', marginRight: '0.5rem' }}>{title}</span>
        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setZoom(z => Math.min(z + 0.2, 2.5))}>
          <ZoomIn size={14} />
        </button>
        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))}>
          <ZoomOut size={14} />
        </button>
        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => { setZoom(1); setPan({ x: 40, y: 40 }); }}>
          <RotateCcw size={14} />
        </button>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontFamily: 'var(--font-mono)' }}>
          Depth: {circuit.depth} | Gates: {circuit.gates.length}
        </span>
      </div>

      {/* Selected Gate Inspection Card */}
      {selectedGate && (
        <div style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          zIndex: 10,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '1rem',
          borderRadius: '8px',
          width: '280px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: '700', color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
              {selectedGate.id} ({selectedGate.type})
            </span>
            <button onClick={() => setSelectedGate(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div><strong>Gate Type:</strong> {selectedGate.type}</div>
            <div><strong>Inputs:</strong> {selectedGate.inputs.length > 0 ? selectedGate.inputs.join(', ') : 'None'}</div>
            <div><strong>Outputs:</strong> {selectedGate.outputs.length > 0 ? selectedGate.outputs.join(', ') : 'None'}</div>
            <div><strong>Topological Layer:</strong> Depth {selectedGate.depth}</div>
          </div>
        </div>
      )}

      {/* SVG Canvas for Dynamic Gates & Wires */}
      <svg width="100%" height="100%" style={{ width: '100%', height: '100%' }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Render Dynamic Wires Connecting Pin Outlets to Pin Inlets */}
          {circuit.gates.map((srcGate) => {
            const srcPos = gatePositions[srcGate.id];
            if (!srcPos) return null;

            return srcGate.outputs.map((targetId, outIdx) => {
              const tgtPos = gatePositions[targetId];
              if (!tgtPos) return null;

              const x1 = srcPos.outPin.x;
              const y1 = srcPos.outPin.y;

              // Determine which input pin slot to target on target gate
              let x2 = tgtPos.inPin0.x;
              let y2 = tgtPos.inPin0.y;

              if (tgtPos.gate.inputs.length > 1) {
                const inputIndex = tgtPos.gate.inputs.indexOf(srcGate.id);
                if (inputIndex === 1) {
                  x2 = tgtPos.inPin1.x;
                  y2 = tgtPos.inPin1.y;
                }
              }

              const dx = Math.max((x2 - x1) / 2, 20);
              const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

              return (
                <path
                  key={`${srcGate.id}->${targetId}:${outIdx}`}
                  d={pathData}
                  fill="none"
                  stroke="#475569"
                  strokeWidth="2"
                  markerEnd="url(#arrow)"
                />
              );
            });
          })}

          {/* Render Dynamic Gate Nodes */}
          {circuit.gates.map((gate) => {
            const pos = gatePositions[gate.id];
            if (!pos) return null;

            const isSelected = selectedGate && selectedGate.id === gate.id;

            return (
              <g
                key={gate.id}
                transform={`translate(${pos.x}, ${pos.y})`}
              >
                <GateSymbol
                  type={gate.type}
                  label={gate.label || gate.id}
                  isSelected={isSelected}
                  onClick={() => setSelectedGate(gate)}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
