import React from 'react';
import MonacoEditor from '@monaco-editor/react';

export default function Editor({ code, onChange, errors }) {
  const handleEditorWillMount = (monaco) => {
    // Register custom language for LogicOpt DSL
    monaco.languages.register({ id: 'logicopt' });

    monaco.languages.setMonarchTokensProvider('logicopt', {
      keywords: ['input', 'output', 'wire', 'AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR'],
      operators: ['='],
      symbols: /[=;,()]/,
      tokenizer: {
        root: [
          [/[a-zA-Z_][a-zA-Z0-9_]*/, {
            cases: {
              '@keywords': 'keyword',
              '@default': 'identifier'
            }
          }],
          [/[01]/, 'number'],
          [/[=;,()]/, 'delimiter'],
          [/\/\/.*$/, 'comment'],
          [/\/\*/, 'comment', '@comment']
        ],
        comment: [
          [/[^\/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[\/*]/, 'comment']
        ]
      }
    });

    monaco.editor.defineTheme('logicoptTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '38bdf8', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'f8fafc' },
        { token: 'number', foreground: 'facc15' },
        { token: 'delimiter', foreground: '94a3b8' },
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' }
      ],
      colors: {
        'editor.background': '#0b0f19',
        'editor.lineHighlightBackground': '#1e293b'
      }
    });
  };

  const handleEditorDidMount = (editor, monaco) => {
    if (errors && errors.length > 0) {
      const markers = errors.map((err) => ({
        startLineNumber: err.line || 1,
        startColumn: err.column || 1,
        endLineNumber: err.line || 1,
        endColumn: (err.column || 1) + 5,
        message: err.message,
        severity: monaco.MarkerSeverity.Error
      }));
      monaco.editor.setModelMarkers(editor.getModel(), 'logicopt', markers);
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MonacoEditor
        height="100%"
        language="logicopt"
        theme="logicoptTheme"
        value={code}
        onChange={(val) => onChange(val || '')}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          lineNumbers: 'on',
          padding: { top: 12, bottom: 12 }
        }}
      />
    </div>
  );
}
