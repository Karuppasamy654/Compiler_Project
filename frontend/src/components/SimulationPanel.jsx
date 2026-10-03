import React from 'react';
import { Play, Pause, Activity, Zap, Layers, RefreshCw } from 'lucide-react';

export default function SimulationPanel({
  circuit,
  inputValuation,
  onToggleInput,
  evaluatedSignals,
  simulationActive,
  onToggleSimulation,
  showSignalValues,
  onToggleSignalValues
}) {
  if (!circuit || !circuit.inputs || circuit.inputs.length === 0) {
    return null;
  }

  const inputs = circuit.inputs || [];
  const outputs = circuit.outputs || [];
  const depth = circuit.depth || 0;
  const gateCount = (circuit.gates || []).filter(g =>
    g.type !== 'INPUT' && g.type !== 'OUTPUT' && g.type !== 'WIRE' && g.type !== 'CONSTANT'
  ).length;

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.8rem 1.25rem',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      userSelect: 'none'
    }}>
      {/* Left: Simulation Control & Status Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className={`btn ${simulationActive ? 'btn-primary' : 'btn-secondary'}`}
          onClick={onToggleSimulation}
          style={{ padding: '0.4rem 0.8rem' }}
        >
          {simulationActive ? <Pause size={15} /> : <Play size={15} />}
          <span>{simulationActive ? 'Simulation ACTIVE' : 'Simulation PAUSED'}</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.8rem',
          fontWeight: '600',
          color: simulationActive ? 'var(--accent-green)' : 'var(--text-muted)',
          background: simulationActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.1)',
          padding: '0.25rem 0.6rem',
          borderRadius: '9999px',
          border: `1px solid ${simulationActive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(148, 163, 184, 0.2)'}`
        }}>
          <Activity size={13} />
          <span>Status: {simulationActive ? 'RUNNING' : 'READY'}</span>
        </div>

        {/* Dynamic Circuit KPI Statistics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span>Inputs: <strong style={{ color: 'var(--accent-blue)' }}>{inputs.length}</strong></span>
          <span>Gates: <strong style={{ color: 'var(--accent-orange)' }}>{gateCount}</strong></span>
          <span>Outputs: <strong style={{ color: 'var(--accent-green)' }}>{outputs.length}</strong></span>
          <span>Depth: <strong style={{ color: 'var(--accent-yellow)' }}>{depth}</strong></span>
        </div>
      </div>

      {/* Center: Primary Input Clickable Toggles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-blue)' }}>INPUTS:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {inputs.map((inName) => {
              const val = inputValuation[inName] || 0;
              return (
                <div key={inName} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>
                    {inName}:
                  </span>
                  <button
                    className={`sim-toggle-btn ${val ? 'high' : 'low'}`}
                    onClick={() => onToggleInput(inName)}
                    title={`Click to set ${inName} to ${val ? '0 (LOW)' : '1 (HIGH)'}`}
                  >
                    [ {val} ]
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Output Signal Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-green)' }}>OUTPUTS:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {outputs.map((outName) => {
              const val = evaluatedSignals[outName] !== undefined ? evaluatedSignals[outName] : 0;
              return (
                <div key={outName} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{outName}:</span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    background: val ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                    color: val ? '#4ade80' : '#94a3b8',
                    border: `1px solid ${val ? 'rgba(34, 197, 94, 0.4)' : 'rgba(100, 116, 139, 0.3)'}`
                  }}>
                    ● {val ? 'HIGH (1)' : 'LOW (0)'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Viewport Toggles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          className={`btn ${showSignalValues ? 'btn-primary' : 'btn-secondary'}`}
          onClick={onToggleSignalValues}
          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
        >
          <Zap size={13} />
          <span>{showSignalValues ? 'Signal Values: ON' : 'Signal Values: OFF'}</span>
        </button>
      </div>
    </div>
  );
}
