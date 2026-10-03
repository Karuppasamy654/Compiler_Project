import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, AlertOctagon, Move, Eye, Save } from 'lucide-react';

// IEEE Std 91 Digital Logic Gate SVG Component
function SvgGateSymbol({ type, label, isSelected, onClick, signalValue, showValue, mode }) {
  const isHigh = signalValue === 1;
  const strokeColor = isSelected ? '#38bdf8' : (isHigh ? '#22c55e' : '#94a3b8');
  const fillColor = isSelected ? 'rgba(56, 189, 248, 0.25)' : (isHigh ? 'rgba(34, 197, 94, 0.15)' : '#1e293b');
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
            <path d="M 2,5 Q 16,25 2,45" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
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
            <path d="M 2,5 Q 16,25 2,45" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
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
            <rect x="0" y="8" width="55" height="24" rx="4" fill={isHigh ? "#0284c7" : "#1e293b"} stroke={isHigh ? "#38bdf8" : "#64748b"} strokeWidth={strokeWidth} />
            <text x="27" y="24" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="var(--font-mono)">
              {label}
            </text>
            <line x1="55" y1="20" x2="67" y2="20" stroke={isHigh ? "#22c55e" : "#64748b"} strokeWidth={strokeWidth} />
          </g>
        );
      case 'OUTPUT':
        return (
          <g>
            <line x1="0" y1="20" x2="12" y2="20" stroke={isHigh ? "#22c55e" : "#64748b"} strokeWidth={strokeWidth} />
            <rect x="12" y="8" width="55" height="24" rx="4" fill={isHigh ? "#15803d" : "#1e293b"} stroke={isHigh ? "#4ade80" : "#64748b"} strokeWidth={strokeWidth} />
            <text x="39" y="24" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="var(--font-mono)">
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
      default:
        return null;
    }
  };

  return (
    <g onClick={onClick} style={{ cursor: mode === 'LAYOUT' ? 'grab' : 'pointer' }}>
      {renderShape()}
      {/* Label under logic gate */}
      {type !== 'INPUT' && type !== 'OUTPUT' && type !== 'CONSTANT' && (
        <text
          x="32"
          y="56"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="10"
          fontWeight="600"
          fontFamily="var(--font-mono)"
        >
          {type}
        </text>
      )}
      {/* Signal value overlay indicator */}
      {showValue && signalValue !== undefined && (
        <circle cx="62" cy="10" r="7" fill={isHigh ? "#22c55e" : "#475569"} stroke="#080c14" strokeWidth="1.5" />
      )}
      {showValue && signalValue !== undefined && (
        <text x="62" y="13.5" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="var(--font-mono)">
          {signalValue}
        </text>
      )}
    </g>
  );
}

export default function CircuitSimulator({
  circuit,
  title,
  compilationFailed,
  errorMessage,
  evaluatedSignals,
  showSignalValues
}) {
  const [selectedGate, setSelectedGate] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 60, y: 50 });
  const [mode, setMode] = useState('VIEW'); // 'VIEW' | 'LAYOUT'

  // Dragging states
  const [isPanning, setIsPanning] = useState(false);
  const [draggingGateId, setDraggingGateId] = useState(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const gateDragOffset = useRef({ x: 0, y: 0 });

  // Custom node layout positions state
  const [positions, setPositions] = useState({});

  // Compute circuit fingerprint hash for layout caching
  const getCircuitHash = (c) => {
    if (!c || !c.gates) return '';
    return c.gates.map(g => `${g.id}:${g.type}:${g.depth}`).join('|');
  };

  // 1. Initialize or load custom positions from localStorage when circuit changes
  useEffect(() => {
    if (!circuit || !circuit.gates || circuit.gates.length === 0) {
      setPositions({});
      return;
    }

    const hash = getCircuitHash(circuit);
    const storageKey = `logicopt_layout_${title.replace(/\s+/g, '_')}_${hash}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        setPositions(JSON.parse(saved));
        return;
      } catch (e) {
        // Fallback to auto-layout
      }
    }

    // Default topological auto-layout
    const visibleGates = circuit.gates.filter(g => g.type !== 'WIRE');
    const depthGroups = {};
    visibleGates.forEach((gate) => {
      let d = gate.depth || 0;
      if (gate.type === 'OUTPUT') d = (circuit.depth || 0) + 1;
      if (!depthGroups[d]) depthGroups[d] = [];
      depthGroups[d].push(gate);
    });

    const columnWidth = 230;
    const rowHeight = 100;
    const autoPos = {};

    Object.keys(depthGroups).sort((a, b) => parseInt(a, 10) - parseInt(b, 10)).forEach((depthStr) => {
      const depth = parseInt(depthStr, 10);
      const gatesInDepth = depthGroups[depth];
      gatesInDepth.forEach((gate, idx) => {
        autoPos[gate.id] = {
          x: depth * columnWidth + 80,
          y: idx * rowHeight + 60
        };
      });
    });

    setPositions(autoPos);
  }, [circuit, title]);

  // Save current positions to localStorage
  const savePositionsToStorage = (newPos) => {
    if (!circuit || !circuit.gates) return;
    const hash = getCircuitHash(circuit);
    const storageKey = `logicopt_layout_${title.replace(/\s+/g, '_')}_${hash}`;
    localStorage.setItem(storageKey, JSON.stringify(newPos));
  };

  // 2. Error state handling: If compilation failed or circuit is empty, render clean Error panel
  if (compilationFailed || !circuit || !circuit.gates || circuit.gates.length === 0) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-canvas)',
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
            maxWidth: '520px'
          }}>
            <AlertOctagon size={42} color="var(--accent-red)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--accent-red)', marginBottom: '0.5rem', fontWeight: 700 }}>
              Compilation Failed
            </h3>
            <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>
              {errorMessage || 'Circuit generation skipped due to syntax or semantic errors.'}
            </p>
            <div style={{
              background: '#080c14',
              padding: '0.6rem 1rem',
              borderRadius: '6px',
              color: 'var(--accent-red)',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)'
            }}>
              [Circuit unavailable until compilation succeeds]
            </div>
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

  // Filter visible gates (collapsing intermediate internal WIRE nodes so t1, t2, t3 are hidden)
  const visibleGates = circuit.gates.filter(g => g.type !== 'WIRE');

  // Compute pin snap coordinates for each node based on positions state
  const gatePinCoordinates = {};
  visibleGates.forEach((gate) => {
    const pos = positions[gate.id] || { x: 100, y: 100 };
    const { x, y } = pos;

    let inPin0 = { x: x, y: y + 15 };
    let inPin1 = { x: x, y: y + 35 };
    let outPin = { x: x + 65, y: y + 25 };

    if (gate.type === 'INPUT') {
      outPin = { x: x + 67, y: y + 20 };
    } else if (gate.type === 'OUTPUT') {
      inPin0 = { x: x, y: y + 20 };
      outPin = { x: x + 67, y: y + 20 };
    } else if (gate.type === 'NOT') {
      inPin0 = { x: x, y: y + 25 };
      outPin = { x: x + 62, y: y + 25 };
    } else if (gate.type === 'CONSTANT') {
      outPin = { x: x + 45, y: y + 20 };
    } else if (gate.type === 'NAND' || gate.type === 'NOR' || gate.type === 'XNOR') {
      outPin = { x: x + 68, y: y + 25 };
    }

    gatePinCoordinates[gate.id] = { x, y, inPin0, inPin1, outPin, gate };
  });

  // Resolve source gate ID bypassing internal WIRE nodes
  const resolveSourceGateId = (srcId) => {
    let curr = srcId;
    let limit = 10;
    while (limit-- > 0) {
      const found = circuit.gates.find(g => g.id === curr);
      if (found && found.type === 'WIRE' && found.inputs && found.inputs.length > 0) {
        curr = found.inputs[0];
      } else {
        break;
      }
    }
    return curr;
  };

  // Build resolved wire connections directly between visible gates
  const resolvedWires = [];
  visibleGates.forEach((dstGate) => {
    if (!dstGate.inputs) return;
    dstGate.inputs.forEach((inpId, inIdx) => {
      const actualSrcId = resolveSourceGateId(inpId);
      if (gatePinCoordinates[actualSrcId] && gatePinCoordinates[dstGate.id]) {
        resolvedWires.push({
          srcId: actualSrcId,
          dstId: dstGate.id,
          inputIndex: inIdx,
          signalName: inpId
        });
      }
    });
  });

  // Fit Circuit Bounding Box
  const handleFitCircuit = () => {
    const keys = Object.keys(positions);
    if (keys.length === 0) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    keys.forEach(k => {
      const p = positions[k];
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const width = maxX - minX + 200;
    const height = maxY - minY + 200;
    const containerW = 800; // estimated viewport width
    const containerH = 500;

    const scaleX = containerW / width;
    const scaleY = containerH / height;
    const newZoom = Math.max(0.5, Math.min(1.2, Math.min(scaleX, scaleY)));

    setZoom(newZoom);
    setPan({
      x: 40 - minX * newZoom,
      y: 40 - minY * newZoom
    });
  };

  // Mouse Dragging Handlers (Gate Node Dragging vs View Canvas Panning)
  const handleGateMouseDown = (e, gateId) => {
    e.stopPropagation();
    setSelectedGate(visibleGates.find(g => g.id === gateId));
    setDraggingGateId(gateId);

    const pos = positions[gateId] || { x: 0, y: 0 };
    // Convert screen coordinates to zoomed canvas coordinates
    gateDragOffset.current = {
      x: (e.clientX - pan.x) / zoom - pos.x,
      y: (e.clientY - pan.y) / zoom - pos.y
    };
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.tagName === 'g') {
      setIsPanning(true);
      dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e) => {
    if (draggingGateId) {
      const newX = (e.clientX - pan.x) / zoom - gateDragOffset.current.x;
      const newY = (e.clientY - pan.y) / zoom - gateDragOffset.current.y;

      const updated = {
        ...positions,
        [draggingGateId]: { x: Math.round(newX), y: Math.round(newY) }
      };
      setPositions(updated);
      savePositionsToStorage(updated);
    } else if (isPanning) {
      setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    }
  };

  const handleMouseUp = () => {
    setDraggingGateId(null);
    setIsPanning(false);
  };

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
        background: 'var(--bg-canvas)',
        overflow: 'hidden',
        cursor: draggingGateId ? 'grabbing' : (isPanning ? 'grabbing' : 'grab')
      }}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Circuit Toolbar */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(30, 41, 59, 0.95)',
        backdropFilter: 'blur(8px)',
        padding: '0.4rem 0.8rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
      }}>
        <span style={{ fontWeight: '700', fontSize: '0.85rem', marginRight: '0.4rem', color: 'var(--accent-blue)' }}>{title}</span>

        {/* View Mode vs Layout Mode Switcher */}
        <div style={{ display: 'flex', background: 'var(--bg-darker)', borderRadius: '6px', padding: '2px', marginRight: '0.4rem' }}>
          <button
            className={`btn ${mode === 'VIEW' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('VIEW')}
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
            title="View Mode (Simulate & Inspect)"
          >
            <Eye size={13} />
            <span>VIEW</span>
          </button>
          <button
            className={`btn ${mode === 'LAYOUT' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('LAYOUT')}
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
            title="Layout Mode (Drag Gates & Arrange Circuit)"
          >
            <Move size={13} />
            <span>LAYOUT</span>
          </button>
        </div>

        {/* Zoom & Fit Controls */}
        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setZoom(z => Math.min(z + 0.2, 2.5))} title="Zoom In">
          <ZoomIn size={14} />
        </button>
        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))} title="Zoom Out">
          <ZoomOut size={14} />
        </button>
        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={handleFitCircuit} title="Fit Circuit to Viewport">
          <Maximize2 size={14} />
        </button>
        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => { setZoom(1); setPan({ x: 60, y: 50 }); }} title="Reset View">
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Selected Gate Metadata Inspector */}
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
            <div><strong>Inputs:</strong> {selectedGate.inputs && selectedGate.inputs.length > 0 ? selectedGate.inputs.join(', ') : 'None'}</div>
            <div><strong>Outputs:</strong> {selectedGate.outputs && selectedGate.outputs.length > 0 ? selectedGate.outputs.join(', ') : 'None'}</div>
            <div><strong>Topological Layer:</strong> Depth {selectedGate.depth}</div>
          </div>
        </div>
      )}

      {/* Main Interactive SVG Canvas */}
      <svg width="100%" height="100%" style={{ width: '100%', height: '100%' }}>
        <defs>
          <marker id="arrow-high" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
          </marker>
          <marker id="arrow-low" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Render Orthogonal / Elbow Stepped Wires directly connecting gate ports */}
          {resolvedWires.map((wire, wIdx) => {
            const srcPos = gatePinCoordinates[wire.srcId];
            const dstPos = gatePinCoordinates[wire.dstId];

            if (!srcPos || !dstPos) return null;

            const x1 = srcPos.outPin.x;
            const y1 = srcPos.outPin.y;

            let x2 = dstPos.inPin0.x;
            let y2 = dstPos.inPin0.y;

            if (dstPos.gate.inputs && dstPos.gate.inputs.length > 1) {
              if (wire.inputIndex === 1) {
                x2 = dstPos.inPin1.x;
                y2 = dstPos.inPin1.y;
              }
            }

            // Stepped orthogonal elbow path: (x1, y1) -> (midX, y1) -> (midX, y2) -> (x2, y2)
            const midX = x1 + Math.max((x2 - x1) / 2, 20);
            const orthogonalPath = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;

            // Signal value for wire
            const signalVal = evaluatedSignals && (
              evaluatedSignals[wire.signalName] !== undefined ? evaluatedSignals[wire.signalName] :
              evaluatedSignals[wire.srcId] !== undefined ? evaluatedSignals[wire.srcId] : 0
            );

            const isHigh = signalVal === 1;
            const strokeColor = isHigh ? '#22c55e' : '#475569';
            const strokeWidth = isHigh ? 2.5 : 2;

            return (
              <g key={`wire:${wire.srcId}->${wire.dstId}:${wIdx}`}>
                {/* Wire line glow background */}
                <path
                  d={orthogonalPath}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth + 2}
                  strokeOpacity={isHigh ? 0.3 : 0}
                />
                {/* Core wire line */}
                <path
                  className={isHigh ? "active-wire-flow" : ""}
                  d={orthogonalPath}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  markerEnd={isHigh ? "url(#arrow-high)" : "url(#arrow-low)"}
                />
                {/* Optional floating signal value badge on wire */}
                {showSignalValues && (
                  <g transform={`translate(${midX}, ${(y1 + y2) / 2})`}>
                    <rect x="-8" y="-8" width="16" height="16" rx="4" fill="#080c14" stroke={strokeColor} strokeWidth="1" />
                    <text x="0" y="3.5" textAnchor="middle" fill={isHigh ? "#4ade80" : "#94a3b8"} fontSize="9" fontWeight="bold" fontFamily="var(--font-mono)">
                      {signalVal}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Render Draggable Visible Gate Nodes */}
          {visibleGates.map((gate) => {
            const pos = gatePinCoordinates[gate.id] || { x: 100, y: 100 };
            const isSelected = selectedGate && selectedGate.id === gate.id;
            const signalVal = evaluatedSignals && evaluatedSignals[gate.id] !== undefined ? evaluatedSignals[gate.id] : 0;

            return (
              <g
                key={gate.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onMouseDown={(e) => handleGateMouseDown(e, gate.id)}
              >
                <SvgGateSymbol
                  type={gate.type}
                  label={gate.label || gate.id}
                  isSelected={isSelected}
                  onClick={() => setSelectedGate(gate)}
                  signalValue={signalVal}
                  showValue={showSignalValues}
                  mode={mode}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
