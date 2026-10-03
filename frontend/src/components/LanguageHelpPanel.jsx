import React from 'react';
import { HelpCircle, BookOpen, Code2 } from 'lucide-react';

export default function LanguageHelpPanel({ onClose }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '1rem',
      margin: '0.5rem 1rem 1rem 1rem',
      fontSize: '0.82rem',
      color: 'var(--text-main)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <span style={{ fontWeight: '700', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <BookOpen size={16} />
          <span>LogicOpt Language Quick Guide</span>
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: 'var(--font-mono)' }}>
        <div style={{ background: '#080c14', padding: '0.5rem 0.8rem', borderRadius: '4px', borderLeft: '3px solid var(--accent-blue)' }}>
          <div style={{ color: 'var(--accent-blue)' }}>INPUT A, B, C</div>
          <div style={{ color: 'var(--accent-green)' }}>OUTPUT Y</div>
          <div style={{ color: '#fff', marginTop: '0.2rem' }}>Y = (A AND B) OR NOT C</div>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', lineHeight: '1.4' }}>
          • <strong>No wire declarations required!</strong> Intermediate signals are created automatically.<br />
          • <strong>Semicolons are optional.</strong> Use newlines or semicolons freely.<br />
          • <strong>Operators:</strong> <span style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>NOT, AND, OR, XOR, NAND, NOR, XNOR</span><br />
          • <strong>Constants:</strong> <span style={{ color: 'var(--accent-yellow)', fontFamily: 'var(--font-mono)' }}>0, 1</span><br />
          • <strong>Precedence:</strong> Parentheses <code>()</code> &gt; <code>NOT</code> &gt; <code>AND/NAND</code> &gt; <code>XOR/XNOR</code> &gt; <code>OR/NOR</code>
        </div>
      </div>
    </div>
  );
}
