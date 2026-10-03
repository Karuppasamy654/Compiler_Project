import React from 'react';

export default function AstView({ ast }) {
  if (!ast) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>No AST generated yet.</div>;
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '1.5rem', background: '#0b0f19', color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
      <pre style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
        {JSON.stringify(ast, null, 2)}
      </pre>
    </div>
  );
}
