import React from 'react';
import { BarChart3, TrendingDown, Layers, Zap } from 'lucide-react';

export default function MetricsView({ metrics }) {
  if (!metrics || !metrics.original) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No metrics available. Compile your circuit code first.
      </div>
    );
  }

  const orig = metrics.original;
  const opt = metrics.optimized;

  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BarChart3 size={18} color="var(--accent-blue)" />
        <span>Circuit Synthesis & Optimization Metrics</span>
      </h3>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={cardStyle}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Original Gates</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{orig.totalGates}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Depth: {orig.circuitDepth}</span>
        </div>

        <div style={cardStyle}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Optimized Gates</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>{opt.totalGates}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)' }}>Depth: {opt.circuitDepth}</span>
        </div>

        <div style={cardStyle}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gate Reduction</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)' }}>
              {metrics.gateReductionPercentage.toFixed(1)}%
            </span>
            <TrendingDown size={22} color="var(--accent-purple)" />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {metrics.gateReduction > 0 ? `${metrics.gateReduction} Gates Eliminated` : 'No structural optimization found'}
          </span>
        </div>

        <div style={cardStyle}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Depth Reduction</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-yellow)', fontFamily: 'var(--font-mono)' }}>
              {metrics.depthReductionPercentage.toFixed(1)}%
            </span>
            <Layers size={22} color="var(--accent-yellow)" />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {metrics.depthReduction > 0 ? `${metrics.depthReduction} Levels Saved` : 'Original structure maintained'}
          </span>
        </div>
      </div>

      {metrics.gateReduction === 0 && (
        <div style={{
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '8px',
          padding: '0.8rem 1.25rem',
          marginBottom: '1.5rem',
          color: 'var(--accent-blue)',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>Notice: No structural optimization found. The circuit is already in minimal optimal form.</span>
        </div>
      )}

      {/* Detailed Gate Comparison Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>
          Gate Component Comparison
        </div>
        <table>
          <thead>
            <tr>
              <th>Metric / Component</th>
              <th>Original Circuit</th>
              <th>Optimized Circuit</th>
              <th>Difference</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>AND Gates</strong></td>
              <td>{orig.andGates}</td>
              <td style={{ color: 'var(--accent-green)' }}>{opt.andGates}</td>
              <td>{orig.andGates - opt.andGates}</td>
            </tr>
            <tr>
              <td><strong>OR Gates</strong></td>
              <td>{orig.orGates}</td>
              <td style={{ color: 'var(--accent-green)' }}>{opt.orGates}</td>
              <td>{orig.orGates - opt.orGates}</td>
            </tr>
            <tr>
              <td><strong>NOT Gates</strong></td>
              <td>{orig.notGates}</td>
              <td style={{ color: 'var(--accent-green)' }}>{opt.notGates}</td>
              <td>{orig.notGates - opt.notGates}</td>
            </tr>
            <tr>
              <td><strong>XOR Gates</strong></td>
              <td>{orig.xorGates}</td>
              <td style={{ color: 'var(--accent-green)' }}>{opt.xorGates}</td>
              <td>{orig.xorGates - opt.xorGates}</td>
            </tr>
            <tr>
              <td><strong>NAND / NOR / XNOR Gates</strong></td>
              <td>{orig.nandGates + orig.norGates + orig.xnorGates}</td>
              <td style={{ color: 'var(--accent-green)' }}>{opt.nandGates + opt.norGates + opt.xnorGates}</td>
              <td>{(orig.nandGates + orig.norGates + orig.xnorGates) - (opt.nandGates + opt.norGates + opt.xnorGates)}</td>
            </tr>
            <tr>
              <td><strong>Circuit Depth</strong></td>
              <td>{orig.circuitDepth}</td>
              <td style={{ color: 'var(--accent-yellow)' }}>{opt.circuitDepth}</td>
              <td>{metrics.depthReduction}</td>
            </tr>
            <tr>
              <td><strong>Total Signals / Wires</strong></td>
              <td>{orig.totalWires}</td>
              <td style={{ color: 'var(--accent-purple)' }}>{opt.totalWires}</td>
              <td>{orig.totalWires - opt.totalWires}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
