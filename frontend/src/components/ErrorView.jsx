import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';

export default function ErrorView({ errors, warnings }) {
  const hasErrors = errors && errors.length > 0;
  const hasWarnings = warnings && warnings.length > 0;

  if (!hasErrors && !hasWarnings) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent-green)', fontWeight: 600 }}>
        ✓ Clean compilation! No errors or warnings detected.
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {hasErrors && (
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-red)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} />
            <span>Compiler Errors ({errors.length})</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {errors.map((err, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(248, 113, 113, 0.1)',
                  border: '1px solid rgba(248, 113, 113, 0.3)',
                  borderRadius: '6px',
                  padding: '0.8rem 1rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ fontWeight: 'bold', color: 'var(--accent-red)', marginBottom: '0.2rem' }}>
                  {err.type || 'Error'} [Line {err.line}, Col {err.column}]
                </div>
                <div style={{ color: 'var(--text-main)' }}>{err.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasWarnings && (
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-yellow)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} />
            <span>Compiler Warnings ({warnings.length})</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {warnings.map((warn, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(250, 204, 21, 0.1)',
                  border: '1px solid rgba(250, 204, 21, 0.3)',
                  borderRadius: '6px',
                  padding: '0.8rem 1rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ fontWeight: 'bold', color: 'var(--accent-yellow)', marginBottom: '0.2rem' }}>
                  Warning [Line {warn.line}, Col {warn.column}]
                </div>
                <div style={{ color: 'var(--text-main)' }}>{warn.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
