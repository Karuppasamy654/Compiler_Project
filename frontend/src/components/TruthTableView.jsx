import React from 'react';
import { AlertTriangle, Table } from 'lucide-react';

export default function TruthTableView({ truthTable, activeInputValuation, onSelectRow }) {
  if (!truthTable) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No truth table available. Compile your source code first.
      </div>
    );
  }

  if (truthTable.skipped) {
    return (
      <div style={{
        padding: '2rem',
        margin: '1.5rem',
        background: 'rgba(250, 204, 21, 0.1)',
        border: '1px solid rgba(250, 204, 21, 0.3)',
        borderRadius: '8px',
        color: 'var(--accent-yellow)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <AlertTriangle size={24} />
        <div>
          <h4 style={{ margin: 0, fontWeight: 700 }}>Truth Table Skipped</h4>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>{truthTable.skipReason}</p>
        </div>
      </div>
    );
  }

  const inputs = truthTable.inputs || [];
  const outputs = truthTable.outputs || [];
  const rows = truthTable.rows || [];

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Table size={18} color="var(--accent-green)" />
          <span>Exhaustive Truth Table Evaluation</span>
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {rows.length} Combinations (2^{inputs.length}) — Click row to simulate in circuit
        </span>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '60px' }}>#</th>
              {inputs.map(inName => (
                <th key={inName} style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>{inName} (IN)</th>
              ))}
              {outputs.map(outName => (
                <th key={outName} style={{ color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>{outName} (OUT)</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              // Check if this row matches the active simulator input valuation
              const isSimulatorActive = activeInputValuation && inputs.length > 0 && inputs.every(
                inKey => row.inputs[inKey] === (activeInputValuation[inKey] !== undefined ? activeInputValuation[inKey] : 0)
              );

              return (
                <tr
                  key={idx}
                  className={isSimulatorActive ? "active-truth-row" : ""}
                  onClick={() => onSelectRow && onSelectRow(row.inputs)}
                  style={{ cursor: 'pointer' }}
                  title="Click row to set simulator inputs to this combination"
                >
                  <td style={{ color: isSimulatorActive ? 'var(--accent-blue)' : 'var(--text-muted)', fontWeight: isSimulatorActive ? 'bold' : 'normal' }}>
                    {isSimulatorActive ? "▶ " : ""}{idx + 1}
                  </td>
                  {inputs.map(inName => (
                    <td key={inName}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        fontWeight: isSimulatorActive ? 'bold' : 'normal',
                        background: row.inputs[inName] ? 'rgba(56, 189, 248, 0.2)' : 'rgba(148, 163, 184, 0.1)',
                        color: row.inputs[inName] ? 'var(--accent-blue)' : 'var(--text-muted)'
                      }}>
                        {row.inputs[inName]}
                      </span>
                    </td>
                  ))}
                  {outputs.map(outName => (
                    <td key={outName}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.1rem 0.5rem',
                        borderRadius: '4px',
                        fontWeight: '700',
                        background: row.outputs[outName] ? 'rgba(74, 222, 128, 0.25)' : 'rgba(248, 113, 113, 0.15)',
                        color: row.outputs[outName] ? 'var(--accent-green)' : 'var(--accent-red)'
                      }}>
                        {row.outputs[outName]}
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
