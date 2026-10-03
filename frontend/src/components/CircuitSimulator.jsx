import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, AlertOctagon, Move, Eye, RefreshCw, Info, Layers } from 'lucide-react';
import { getGateDimensions, getGateObstacleBox, getGatePortCoordinates } from '../utils/geometry.js';
import { computeOrthogonalWirePath, computeFanOutJunctions } from '../utils/orthogonalRouter.js';
import { computeTopologyAutoLayout } from '../utils/autoLayout.js';

// Professional Digital Logic Gate Component (IEEE Std 91)
function SvgGateSymbol({ gate, isSelected, isHovered, onClick, signalValue, showValue, mode }) {
  const { type, label } = gate;
  const isHigh = signalValue === 1;
  const strokeColor = isSelected ? '#38bdf8' : (isHovered ? '#60a5fa' : (isHigh ? '#22c55e' : '#94a3b8'));
  const fillColor = isSelected ? 'rgba(56, 189, 248, 0.25)' : (isHovered ? 'rgba(96, 165, 250, 0.2)' : (isHigh ? 'rgba(34, 197, 94, 0.18)' : '#1e293b'));
  const strokeWidth = isSelected ? 2.5 : (isHovered ? 2.2 : 2);

  const renderShape = () => {
    switch (type) {
      case 'AND':
        return (
          <g>
            <path d="M 10,5 L 32,5 A 20,20 0 0 1 32,45 L 10,45 Z" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="15" x2="10" y2="15" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="35" x2="10" y2="35" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="52" y1="25" x2="65" y2="25" stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );
      case 'NAND':
        return (
          <g>
            <path d="M 10,5 L 30,5 A 20,20 0 0 1 30,45 L 10,45 Z" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx="54" cy="25" r="4" fill="#080c14" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="15" x2="10" y2="15" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="35" x2="10" y2="35" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="58" y1="25" x2="70" y2="25" stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );
      case 'OR':
        return (
          <g>
            <path d="M 8,5 Q 22,25 8,45 Q 32,45 52,25 Q 32,5 8,5 Z" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="15" x2="13" y2="15" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="35" x2="13" y2="35" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="52" y1="25" x2="65" y2="25" stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );
      case 'NOR':
        return (
          <g>
            <path d="M 8,5 Q 20,25 8,45 Q 30,45 48,25 Q 30,5 8,5 Z" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx="52" cy="25" r="4" fill="#080c14" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="15" x2="12" y2="15" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="35" x2="12" y2="35" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="56" y1="25" x2="70" y2="25" stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );
      case 'XOR':
        return (
          <g>
            <path d="M 2,5 Q 16,25 2,45" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 9,5 Q 23,25 9,45 Q 33,45 53,25 Q 33,5 9,5 Z" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="15" x2="7" y2="15" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="35" x2="7" y2="35" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="53" y1="25" x2="65" y2="25" stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );
      case 'XNOR':
        return (
          <g>
            <path d="M 2,5 Q 16,25 2,45" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 9,5 Q 21,25 9,45 Q 31,45 49,25 Q 31,5 9,5 Z" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx="53" cy="25" r="4" fill="#080c14" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="15" x2="7" y2="15" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="35" x2="7" y2="35" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="57" y1="25" x2="70" y2="25" stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );
      case 'NOT':
        return (
          <g>
            <path d="M 10,8 L 42,25 L 10,42 Z" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx="46" cy="25" r="4" fill="#080c14" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="25" x2="10" y2="25" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="50" y1="25" x2="62" y2="25" stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );
      case 'INPUT':
        return (
          <g>
            <rect x="0" y="6" width="55" height="28" rx="4" fill={isHigh ? "#0284c7" : "#1e293b"} stroke={isHigh ? "#38bdf8" : "#64748b"} strokeWidth={strokeWidth} />
            <text x="27" y="23" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="var(--font-mono)">
              {label}
            </text>
            <line x1="55" y1="20" x2="67" y2="20" stroke={isHigh ? "#22c55e" : "#64748b"} strokeWidth={strokeWidth} />
          </g>
        );
      case 'OUTPUT':
        return (
          <g>
            <line x1="0" y1="20" x2="12" y2="20" stroke={isHigh ? "#22c55e" : "#64748b"} strokeWidth={strokeWidth} />
            <rect x="12" y="6" width="55" height="28" rx="4" fill={isHigh ? "#15803d" : "#1e293b"} stroke={isHigh ? "#4ade80" : "#64748b"} strokeWidth={strokeWidth} />
            <text x="39" y="23" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="var(--font-mono)">
              {label}
            </text>
          </g>
        );
      case 'CONSTANT':
        return (
          <g>
            <rect x="0" y="6" width="30" height="28" rx="4" fill="#854d0e" stroke="#facc15" strokeWidth={strokeWidth} />
            <text x="15" y="23" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="var(--font-mono)">
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
        <text x="32" y="58" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600" fontFamily="var(--font-mono)">
          {type}
        </text>
      )}
      {/* Signal value overlay indicator */}
      {showValue && signalValue !== undefined && (
        <g transform="translate(62, 8)">
          <circle cx="0" cy="0" r="7" fill={isHigh ? "#22c55e" : "#475569"} stroke="#080c14" strokeWidth="1.5" />
          <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="var(--font-mono)">
            {signalValue}
          </text>
        </g>
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
  const [selectedWire, setSelectedWire] = useState(null);
  const [hoveredWire, setHoveredWire] = useState(null);
  const [hoveredGate, setHoveredGate] = useState(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 60, y: 50 });
  const [mode, setMode] = useState('VIEW'); // 'VIEW' | 'LAYOUT'

  // Dragging states
  const [isPanning, setIsPanning] = useState(false);
  const [draggingGateId, setDraggingGateId] = useState(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const gateDragOffset = useRef({ x: 0, y: 0 });

  // Custom node positions state
  const [positions, setPositions] = useState({});

  const getCircuitHash = (c) => {
    if (!c || !c.gates) return '';
    return c.gates.map(g => `${g.id}:${g.type}:${g.depth}`).join('|');
  };

  // Load custom positions or compute topological auto-layout
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
        // Fallback
      }
    }

    const autoPos = computeTopologyAutoLayout(circuit);
    setPositions(autoPos);
  }, [circuit, title]);

  const savePositionsToStorage = (newPos) => {
    if (!circuit || !circuit.gates) return;
    const hash = getCircuitHash(circuit);
    const storageKey = `logicopt_layout_${title.replace(/\s+/g, '_')}_${hash}`;
    localStorage.setItem(storageKey, JSON.stringify(newPos));
  };

  const handleResetAutoLayout = () => {
    const autoPos = computeTopologyAutoLayout(circuit);
    setPositions(autoPos);
    savePositionsToStorage(autoPos);
  };

  // Error handling panel
  if (compilationFailed || !circuit || !circuit.gates || circuit.gates.length === 0) {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-canvas)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)'
      }}>
        {compilationFailed ? (
          <div style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: '10px', padding: '2rem', maxWidth: '520px' }}>
            <AlertOctagon size={42} color="var(--accent-red)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--accent-red)', marginBottom: '0.5rem', fontWeight: 700 }}>Compilation Failed</h3>
            <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>
              {errorMessage || 'Circuit generation skipped due to syntax or semantic errors.'}
            </p>
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

  // Filter visible gates (hiding intermediate pass-through WIRE nodes)
  const visibleGates = circuit.gates.filter(g => g.type !== 'WIRE');

  // Compute exact port coordinates for visible gates
  const portCoords = {};
  visibleGates.forEach(g => {
    portCoords[g.id] = getGatePortCoordinates(g, positions[g.id] || { x: 100, y: 100 });
  });

  // Collect all gate obstacle boxes (expanded by 20px padding)
  const obstacles = visibleGates.map(g => getGateObstacleBox(g, positions[g.id] || { x: 100, y: 100 }));

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

  // Build resolved wire routes directly connecting visible gate ports using Obstacle-Aware Pathfinder
  const resolvedWires = [];
  visibleGates.forEach(dstGate => {
    if (!dstGate.inputs) return;

    dstGate.inputs.forEach((inpId, inIdx) => {
      const actualSrcId = resolveSourceGateId(inpId);
      const srcPortData = portCoords[actualSrcId];
      const dstPortData = portCoords[dstGate.id];

      if (srcPortData && dstPortData) {
        const srcPort = srcPortData.outputPort;
        const dstPort = dstPortData.inputPorts[inIdx] || dstPortData.inputPorts[0];

        const route = computeOrthogonalWirePath(srcPort, dstPort, obstacles, actualSrcId, dstGate.id);

        resolvedWires.push({
          id: `${actualSrcId}->${dstGate.id}:${inIdx}`,
          srcId: actualSrcId,
          dstId: dstGate.id,
          inputIndex: inIdx,
          signalName: inpId,
          srcPort,
          dstPort,
          points: route.points,
          pathData: route.pathData,
          srcGate: circuit.gates.find(g => g.id === actualSrcId),
          dstGate: dstGate
        });
      }
    });
  });

  // Calculate fan-out junction dots ●
  const junctions = computeFanOutJunctions(resolvedWires);

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

    const width = maxX - minX + 220;
    const height = maxY - minY + 200;
    const containerW = 800;
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

  // Mouse Handlers
  const handleGateMouseDown = (e, gateId) => {
    e.stopPropagation();
    setSelectedGate(visibleGates.find(g => g.id === gateId));
    setSelectedWire(null);
    setDraggingGateId(gateId);

    const pos = positions[gateId] || { x: 0, y: 0 };
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
        height: '100%', width: '100%', position: 'relative', background: 'var(--bg-canvas)', overflow: 'hidden',
        cursor: draggingGateId ? 'grabbing' : (isPanning ? 'grabbing' : 'grab')
      }}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Toolbar Controls */}
      <div style={{
        position: 'absolute', top: 16, left: 16, zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'rgba(30, 41, 59, 0.95)', backdropFilter: 'blur(8px)', padding: '0.4rem 0.8rem', borderRadius: '8px',
        border: '1px solid var(--border-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
      }}>
        <span style={{ fontWeight: '700', fontSize: '0.85rem', marginRight: '0.4rem', color: 'var(--accent-blue)' }}>{title}</span>

        {/* View Mode vs Layout Mode Switcher */}
        <div style={{ display: 'flex', background: 'var(--bg-darker)', borderRadius: '6px', padding: '2px', marginRight: '0.4rem' }}>
          <button className={`btn ${mode === 'VIEW' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('VIEW')} style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
            <Eye size={13} />
            <span>VIEW</span>
          </button>
          <button className={`btn ${mode === 'LAYOUT' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('LAYOUT')} style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
            <Move size={13} />
            <span>LAYOUT</span>
          </button>
        </div>

        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={handleResetAutoLayout} title="Deterministic Auto-Layout">
          <RefreshCw size={14} />
          <span style={{ fontSize: '0.75rem' }}>Auto Layout</span>
        </button>
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

      {/* Wire Inspector Properties Panel */}
      {selectedWire && (
        <div style={{
          position: 'absolute', bottom: 16, left: 16, zIndex: 10, background: 'var(--bg-card)', border: '1px solid var(--accent-blue)',
          padding: '1rem', borderRadius: '8px', width: '300px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: '700', color: 'var(--accent-blue)', fontSize: '0.85rem' }}>
              Signal Connection: {selectedWire.signalName}
            </span>
            <button onClick={() => setSelectedWire(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontFamily: 'var(--font-mono)' }}>
            <div><strong>Signal Name:</strong> {selectedWire.signalName}</div>
            <div><strong>Source Gate:</strong> {selectedWire.srcId} ({selectedWire.srcGate?.type})</div>
            <div><strong>Source Port:</strong> Output Y</div>
            <div><strong>Target Gate:</strong> {selectedWire.dstId} ({selectedWire.dstGate?.type})</div>
            <div><strong>Target Port:</strong> Input Port {selectedWire.inputIndex}</div>
          </div>
        </div>
      )}

      {/* Selected Gate Metadata Inspector */}
      {selectedGate && !selectedWire && (
        <div style={{
          position: 'absolute', bottom: 16, right: 16, zIndex: 10, background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          padding: '1rem', borderRadius: '8px', width: '280px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
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
            <div><strong>Topological Depth:</strong> Level {selectedGate.depth}</div>
          </div>
        </div>
      )}

      {/* SVG Canvas */}
      <svg width="100%" height="100%" style={{ width: '100%', height: '100%' }}>
        <defs>
          <marker id="arrow-high" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
          </marker>
          <marker id="arrow-low" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
          </marker>
          <marker id="arrow-hover" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* LAYER 1: Wire Glow & Active Wires */}
          {resolvedWires.map(wire => {
            const isHovered = (hoveredWire && hoveredWire.id === wire.id) || (hoveredGate && (hoveredGate.id === wire.srcId || hoveredGate.id === wire.dstId));
            const isSelected = selectedWire && selectedWire.id === wire.id;
            const signalVal = evaluatedSignals && (evaluatedSignals[wire.signalName] !== undefined ? evaluatedSignals[wire.signalName] : evaluatedSignals[wire.srcId]);
            const isHigh = signalVal === 1;

            const strokeColor = isSelected ? '#38bdf8' : (isHovered ? '#60a5fa' : (isHigh ? '#22c55e' : '#475569'));
            const strokeWidth = isSelected ? 3 : (isHovered ? 2.5 : 2);

            // Filter user-facing wire labels vs compiler temps
            const showLabel = wire.signalName && !wire.signalName.startsWith('t') && !wire.signalName.startsWith('_t');

            return (
              <g
                key={`wire_${wire.id}`}
                onMouseEnter={() => setHoveredWire(wire)}
                onMouseLeave={() => setHoveredWire(null)}
                onClick={(e) => { e.stopPropagation(); setSelectedWire(wire); setSelectedGate(null); }}
                style={{ cursor: 'pointer' }}
              >
                {/* Invisible wide stroke for easy mouse hovering */}
                <path d={wire.pathData} fill="none" stroke="transparent" strokeWidth="14" />

                {/* Outer Glow */}
                <path d={wire.pathData} fill="none" stroke={strokeColor} strokeWidth={strokeWidth + 4} strokeOpacity={isHovered || isSelected ? 0.4 : (isHigh ? 0.25 : 0)} />

                {/* Core Orthogonal Path */}
                <path
                  d={wire.pathData}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isHovered ? "4 2" : "none"}
                  markerEnd={isSelected || isHovered ? "url(#arrow-hover)" : (isHigh ? "url(#arrow-high)" : "url(#arrow-low)")}
                />

                {/* Signal Name Label */}
                {showLabel && wire.points && wire.points.length >= 2 && (
                  <g transform={`translate(${(wire.points[0].x + wire.points[1].x) / 2}, ${wire.points[0].y - 8})`}>
                    <rect x="-20" y="-8" width="40" height="14" rx="3" fill="#080c14" stroke={strokeColor} strokeWidth="1" opacity="0.9" />
                    <text x="0" y="2" textAnchor="middle" fill="#e2e8f0" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">
                      {wire.signalName}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* LAYER 2: Fan-Out Branching Junction Dots ● */}
          {junctions.map(junc => (
            <circle
              key={junc.id}
              cx={junc.x}
              cy={junc.y}
              r="4.5"
              fill="#38bdf8"
              stroke="#080c14"
              strokeWidth="1.5"
            />
          ))}

          {/* LAYER 3: Gate Bodies (Rendered ABOVE Wires so gates are visually dominant) */}
          {visibleGates.map(gate => {
            const pos = portCoords[gate.id] || { x: 100, y: 100 };
            const isSelected = selectedGate && selectedGate.id === gate.id;
            const isHovered = (hoveredGate && hoveredGate.id === gate.id) || (hoveredWire && (hoveredWire.srcId === gate.id || hoveredWire.dstId === gate.id));
            const signalVal = evaluatedSignals && evaluatedSignals[gate.id] !== undefined ? evaluatedSignals[gate.id] : 0;

            return (
              <g
                key={gate.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onMouseDown={(e) => handleGateMouseDown(e, gate.id)}
                onMouseEnter={() => setHoveredGate(gate)}
                onMouseLeave={() => setHoveredGate(null)}
              >
                <SvgGateSymbol
                  gate={gate}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  onClick={() => { setSelectedGate(gate); setSelectedWire(null); }}
                  signalValue={signalVal}
                  showValue={showSignalValues}
                  mode={mode}
                />
              </g>
            );
          })}

          {/* LAYER 4: Port Snap Circles */}
          {visibleGates.map(gate => {
            const pData = portCoords[gate.id];
            if (!pData) return null;

            return (
              <g key={`ports_${gate.id}`}>
                {pData.inputPorts.map(p => (
                  <circle key={p.id} cx={p.x} cy={p.y} r="3" fill="#38bdf8" stroke="#080c14" strokeWidth="1" />
                ))}
                {pData.outputPort && (
                  <circle cx={pData.outputPort.x} cy={pData.outputPort.y} r="3" fill="#22c55e" stroke="#080c14" strokeWidth="1" />
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
