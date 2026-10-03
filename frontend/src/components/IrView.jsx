import React, { useState } from 'react';

export default function IrView({ originalIr, optimizedIr }) {
  const [viewMode, setViewMode] = useState('split'); // split | original | optimized

  const formatInstruction = (inst) => {
    if (inst.op === 'ASSIGN') return `${inst.result} = ${inst.arg1}`;
    if (inst.op === 'NOT') return `${inst.result} = NOT ${inst.arg1}`;
    return `${inst.result} = ${inst.arg1} ${inst.op} ${inst.arg2}`;
  };

  const renderList = (instructions, title) => (
    <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ padding: '0.8rem 1rem', background: 'var(--bg-darker)', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>
        {title} ({instructions.length} TAC Instructions)
      </div>
      <div style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
        {instructions.length === 0 ? (
          <div style={{ color: 'var(--text-muted)' }}>Empty IR.</div>
        ) : (
          instructions.map((inst, idx) => (
            <div key={idx} style={{ padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', width: '30px' }}>{idx + 1}.</span>
              <span style={{ color: 'var(--accent-purple)' }}>{formatInstruction(inst)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          className={`btn ${viewMode === 'split' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('split')}
        >
          Side-by-Side View
        </button>
        <button
          className={`btn ${viewMode === 'original' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('original')}
        >
          Original IR
        </button>
        <button
          className={`btn ${viewMode === 'optimized' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('optimized')}
        >
          Optimized IR
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '1rem', overflow: 'hidden' }}>
        {(viewMode === 'split' || viewMode === 'original') && renderList(originalIr || [], 'Original IR')}
        {(viewMode === 'split' || viewMode === 'optimized') && renderList(optimizedIr || [], 'Optimized IR')}
      </div>
    </div>
  );
}
