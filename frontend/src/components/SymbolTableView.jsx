import React from 'react';

export default function SymbolTableView({ symbolTable }) {
  if (!symbolTable || symbolTable.length === 0) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>No symbols declared.</div>;
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '1rem' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Signal Name</th>
              <th>Kind</th>
              <th>Line</th>
              <th>Column</th>
              <th>Assigned?</th>
              <th>Used?</th>
            </tr>
          </thead>
          <tbody>
            {symbolTable.map((sym, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: '700', color: 'var(--accent-blue)' }}>{sym.name}</td>
                <td>
                  <span className={`badge ${
                    sym.kind === 'INPUT' ? 'badge-input' :
                    sym.kind === 'OUTPUT' ? 'badge-output' : 'badge-wire'
                  }`}>
                    {sym.kind}
                  </span>
                </td>
                <td>{sym.line}</td>
                <td>{sym.column}</td>
                <td>
                  <span style={{ color: sym.assigned ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {sym.assigned ? 'Yes ✓' : 'No ✗'}
                  </span>
                </td>
                <td>
                  <span style={{ color: sym.used ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                    {sym.used ? 'Yes ✓' : 'No ✗'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
