import React from 'react';
import { Grid, Layers, HelpCircle } from 'lucide-react';

export default function KMapView({ kmap }) {
  if (!kmap || Object.keys(kmap).length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No Karnaugh Map data available. Compile a valid circuit first.
      </div>
    );
  }

  const outputSignals = Object.keys(kmap);

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Grid size={20} color="var(--accent-purple)" />
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
          Karnaugh Map (K-Map) Boolean Minimization
        </h3>
      </div>

      {outputSignals.map((outName) => {
        const data = kmap[outName];
        if (!data || !data.supported) {
          return (
            <div key={outName} style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>Output Signal: {outName}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                K-Map visualization is limited to 2, 3, or 4 input variables. (Current circuit has {data?.numVariables || 'N/A'} inputs).
              </p>
            </div>
          );
        }

        const { variables, rowLabels, colLabels, grid, mintermGrid, groups, minimizedExpression } = data;

        // Label format (e.g., A \ BC)
        const rowVarStr = variables.slice(0, rowLabels[0].length).join('');
        const colVarStr = variables.slice(rowLabels[0].length).join('');

        return (
          <div
            key={outName}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '1.2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', color: 'var(--accent-blue)', fontSize: '0.95rem' }}>
                Output Target: {outName} ({variables.length} Variables: {variables.join(', ')})
              </span>
              <span style={{
                background: 'rgba(192, 132, 252, 0.15)',
                color: 'var(--accent-purple)',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                Minimized: {minimizedExpression}
              </span>
            </div>

            {/* K-Map Grid Matrix */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', textAlign: 'center', margin: '0.5rem 0' }}>
                <thead>
                  <tr>
                    <th style={{
                      background: 'var(--bg-darker)',
                      color: 'var(--accent-blue)',
                      padding: '0.6rem 1rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem'
                    }}>
                      {rowVarStr} \ {colVarStr}
                    </th>
                    {colLabels.map((cLabel) => (
                      <th key={cLabel} style={{
                        background: 'var(--bg-darker)',
                        color: 'var(--text-main)',
                        padding: '0.6rem 1rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem'
                      }}>
                        {cLabel}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rowLabels.map((rLabel, rIdx) => (
                    <tr key={rLabel}>
                      <td style={{
                        background: 'var(--bg-darker)',
                        color: 'var(--text-main)',
                        fontWeight: '700',
                        padding: '0.6rem 1rem',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {rLabel}
                      </td>
                      {colLabels.map((cLabel, cIdx) => {
                        const cellVal = grid[rIdx][cIdx];
                        const mintermNum = mintermGrid[rIdx][cIdx];
                        const isOne = cellVal === '1';

                        return (
                          <td
                            key={`${rIdx}-${cIdx}`}
                            style={{
                              background: isOne ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-card)',
                              border: '1px solid var(--border-color)',
                              padding: '0.8rem 1.2rem',
                              position: 'relative'
                            }}
                          >
                            <span style={{
                              position: 'absolute',
                              top: 2,
                              right: 4,
                              fontSize: '0.65rem',
                              color: 'var(--text-muted)'
                            }}>
                              m{mintermNum}
                            </span>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '1.1rem',
                              fontWeight: '700',
                              color: isOne ? '#4ade80' : 'var(--text-muted)'
                            }}>
                              {cellVal}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Implicant Groups List */}
            {groups && groups.length > 0 && (
              <div style={{ fontSize: '0.82rem', background: 'var(--bg-darker)', padding: '0.8rem', borderRadius: '6px' }}>
                <strong style={{ color: 'var(--accent-purple)' }}>Algorithmic Prime Implicant Groups:</strong>
                <ul style={{ marginTop: '0.4rem', marginLeft: '1.2rem', color: 'var(--text-main)' }}>
                  {groups.map((g, gIdx) => (
                    <li key={gIdx} style={{ fontFamily: 'var(--font-mono)' }}>
                      Group {gIdx + 1}: Minterms {JSON.stringify(g.minterms)} &rarr; {g.expression}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
