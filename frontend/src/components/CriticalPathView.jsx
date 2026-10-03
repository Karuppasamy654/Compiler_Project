import React from 'react';
import { Clock, Zap, Cpu } from 'lucide-react';

export default function CriticalPathView({ criticalPath }) {
  if (!criticalPath || !criticalPath.criticalPathGates || criticalPath.criticalPathGates.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No critical path data available. Compile a valid circuit first.
      </div>
    );
  }

  const { totalDepth, estimatedDelayNs, criticalOutput, criticalPathGates, maxFanIn, maxFanOut } = criticalPath;

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Clock size={20} color="var(--accent-orange)" />
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
          Timing & Critical Path Analysis
        </h3>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL LOGIC DEPTH</span>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-blue)', marginTop: '0.2rem' }}>
            {totalDepth} Layers
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>ESTIMATED PROPAGATION DELAY</span>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-orange)', marginTop: '0.2rem' }}>
            {estimatedDelayNs.toFixed(2)} ns
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>MAX FAN-IN / FAN-OUT</span>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-purple)', marginTop: '0.2rem' }}>
            {maxFanIn} / {maxFanOut}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>CRITICAL OUTPUT TARGET</span>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-green)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
            {criticalOutput}
          </div>
        </div>
      </div>

      {/* Critical Path Sequence */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.2rem' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-orange)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Zap size={16} /> Longest Critical Propagation Path Node Sequence
        </h4>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          {criticalPathGates.map((gateId, idx) => (
            <React.Fragment key={gateId}>
              <div style={{
                background: 'rgba(251, 146, 60, 0.15)',
                border: '1px solid rgba(251, 146, 60, 0.4)',
                color: 'var(--accent-orange)',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontWeight: '700'
              }}>
                {gateId}
              </div>
              {idx + 1 < criticalPathGates.length && (
                <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>&rarr;</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
