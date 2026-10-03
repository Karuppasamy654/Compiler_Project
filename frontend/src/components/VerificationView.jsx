import React from 'react';
import { ShieldCheck, ShieldAlert, XCircle } from 'lucide-react';

export default function VerificationView({ verification }) {
  if (!verification) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>No verification data available.</div>;
  }

  const { equivalent, verified, message, counterExample } = verification;

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '1.5rem' }}>
      {/* Primary Verification Result Card */}
      <div style={{
        background: equivalent ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
        border: `1px solid ${equivalent ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
        borderRadius: '10px',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        {equivalent ? (
          <ShieldCheck size={42} color="var(--accent-green)" />
        ) : (
          <ShieldAlert size={42} color="var(--accent-red)" />
        )}
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: equivalent ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {equivalent ? 'Functional Equivalence Verified: MATCH' : 'Functional Equivalence Mismatch: MISMATCH'}
          </h2>
          <p style={{ margin: '0.4rem 0 0 0', color: 'var(--text-main)', fontSize: '0.95rem' }}>
            {message}
          </p>
        </div>
      </div>

      {/* Counterexample Card if mismatch */}
      {!equivalent && counterExample && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--accent-red)', borderRadius: '10px', padding: '1.25rem' }}>
          <h4 style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <XCircle size={18} />
            <span>Counterexample Found</span>
          </h4>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div>
              <strong>Input Values: </strong>
              {Object.entries(counterExample.inputs || {}).map(([k, v]) => `${k} = ${v}`).join(', ')}
            </div>
            <div>
              <strong>Original Circuit Outputs: </strong>
              <span style={{ color: 'var(--accent-blue)' }}>
                {Object.entries(counterExample.originalOutputs || {}).map(([k, v]) => `${k} = ${v}`).join(', ')}
              </span>
            </div>
            <div>
              <strong>Optimized Circuit Outputs: </strong>
              <span style={{ color: 'var(--accent-red)' }}>
                {Object.entries(counterExample.optimizedOutputs || {}).map(([k, v]) => `${k} = ${v}`).join(', ')}
              </span>
            </div>
            <div style={{ color: 'var(--accent-red)', marginTop: '0.5rem', fontWeight: 'bold' }}>
              Mismatch detected on output signal: '{counterExample.mismatchedOutput}'
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
