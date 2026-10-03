import React from 'react';
import { Play, Code2, Download, CheckCircle2, XCircle, Cpu } from 'lucide-react';

export default function Header({
  examples,
  selectedExample,
  onSelectExample,
  onCompile,
  isCompiling,
  backendHealthy,
  onExport
}) {
  return (
    <header style={{
      height: '60px',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      userSelect: 'none'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontWeight: '700',
          fontSize: '1.25rem',
          letterSpacing: '-0.5px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%)',
            padding: '0.4rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Cpu size={22} color="#fff" />
          </div>
          <span style={{
            background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>LogicOpt</span>
          <span style={{
            fontSize: '0.7rem',
            background: 'rgba(56, 189, 248, 0.1)',
            color: 'var(--accent-blue)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '0.15rem 0.4rem',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)'
          }}>C++17 CORE</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.8rem',
          color: backendHealthy ? 'var(--accent-green)' : 'var(--accent-red)',
          background: backendHealthy ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
          padding: '0.2rem 0.6rem',
          borderRadius: '9999px',
          border: `1px solid ${backendHealthy ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`
        }}>
          {backendHealthy ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
          <span>{backendHealthy ? 'C++ Backend Connected' : 'Backend Disconnected'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Code2 size={16} color="var(--text-muted)" />
          <select
            value={selectedExample}
            onChange={(e) => onSelectExample(e.target.value)}
            style={{
              background: 'var(--bg-darker)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              padding: '0.45rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">Load Example Code...</option>
            {examples.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary"
          onClick={onCompile}
          disabled={isCompiling}
          style={{ opacity: isCompiling ? 0.7 : 1 }}
        >
          <Play size={16} fill="white" />
          <span>{isCompiling ? 'Compiling C++...' : 'Compile Circuit'}</span>
        </button>

        <div style={{ position: 'relative' }}>
          <select
            onChange={(e) => {
              if (e.target.value) {
                onExport(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            style={{
              background: 'var(--bg-hover)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              padding: '0.45rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="" disabled>Export Results...</option>
            <option value="source">Source Code (.logic)</option>
            <option value="json">Full JSON Result (.json)</option>
            <option value="ir">Optimized IR (.tac)</option>
            <option value="truth_table">Truth Table (.csv)</option>
            <option value="verilog">Generated Verilog (.v)</option>
          </select>
        </div>
      </div>
    </header>
  );
}
