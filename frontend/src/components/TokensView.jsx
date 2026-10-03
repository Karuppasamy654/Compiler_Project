import React from 'react';

export default function TokensView({ tokens }) {
  if (!tokens || tokens.length === 0) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>No tokens available.</div>;
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '1rem' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Index</th>
              <th>Token Type</th>
              <th>Lexeme</th>
              <th>Line</th>
              <th>Column</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((tok, idx) => (
              <tr key={idx}>
                <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                <td>
                  <span className={`badge ${
                    tok.type === 'INPUT' || tok.type === 'OUTPUT' || tok.type === 'WIRE' ? 'badge-input' :
                    tok.type === 'IDENTIFIER' ? 'badge-wire' :
                    tok.type === 'INVALID' ? 'badge-error' : 'badge-gate'
                  }`}>
                    {tok.type}
                  </span>
                </td>
                <td style={{ color: 'var(--accent-blue)' }}>{tok.lexeme || 'EOF'}</td>
                <td>{tok.line}</td>
                <td>{tok.column}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
