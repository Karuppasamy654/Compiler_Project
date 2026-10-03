import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function OptimizationReportView({ optimizations }) {
  if (!optimizations || optimizations.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No optimization transformations performed. The circuit is already in minimal optimal form.
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <Sparkles size={20} color="var(--accent-purple)" />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Optimization Transformations Report</h3>
        <span style={{ fontSize: '0.8rem', background: 'rgba(192, 132, 252, 0.15)', color: 'var(--accent-purple)', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: '600' }}>
          {optimizations.length} Passes Applied
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {optimizations.map((step, idx) => (
          <div
            key={idx}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', color: 'var(--accent-blue)', fontSize: '0.9rem' }}>
                #{idx + 1} — Pass {step.pass}: {step.rule}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              <span style={{ background: 'rgba(248, 113, 113, 0.15)', color: 'var(--accent-red)', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                {step.before}
              </span>
              <ArrowRight size={16} color="var(--text-muted)" />
              <span style={{ background: 'rgba(74, 222, 128, 0.15)', color: 'var(--accent-green)', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                {step.after}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
