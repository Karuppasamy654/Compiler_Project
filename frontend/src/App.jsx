import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PanelLeftClose, PanelLeftOpen, PanelBottomClose, PanelBottomOpen, LayoutGrid, Terminal, ChevronUp, ChevronDown } from 'lucide-react';
import Header from './components/Header.jsx';
import Editor from './components/Editor.jsx';
import SimulationPanel from './components/SimulationPanel.jsx';
import CircuitSimulator from './components/CircuitSimulator.jsx';
import TruthTableView from './components/TruthTableView.jsx';
import VerificationView from './components/VerificationView.jsx';
import MetricsView from './components/MetricsView.jsx';
import OptimizationReportView from './components/OptimizationReportView.jsx';
import IrView from './components/IrView.jsx';
import TokensView from './components/TokensView.jsx';
import AstView from './components/AstView.jsx';
import SymbolTableView from './components/SymbolTableView.jsx';
import ErrorView from './components/ErrorView.jsx';
import LanguageHelpPanel from './components/LanguageHelpPanel.jsx';
import ResizableLayout from './components/ResizableLayout.jsx';
import KMapView from './components/KMapView.jsx';
import CriticalPathView from './components/CriticalPathView.jsx';
import { evaluateCircuitSignals } from './utils/simulatorEvaluator.js';

const DEFAULT_CODE = `INPUT A, B, C
OUTPUT Y

Y = (A AND B) OR NOT C
`;

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [examples, setExamples] = useState([]);
  const [selectedExample, setSelectedExample] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('truthTable');
  const [circuitTab, setCircuitTab] = useState('original'); // 'original' | 'optimized' | 'nand' | 'nor'

  // Panel Collapsible States
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [bottomCollapsed, setBottomCollapsed] = useState(false);
  const [simPanelCollapsed, setSimPanelCollapsed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Simulation State
  const [inputValuation, setInputValuation] = useState({});
  const [simulationActive, setSimulationActive] = useState(true);
  const [showSignalValues, setShowSignalValues] = useState(true);

  // Load saved panel states
  useEffect(() => {
    const savedLeft = localStorage.getItem('logicopt_left_collapsed');
    const savedBottom = localStorage.getItem('logicopt_bottom_collapsed');
    if (savedLeft !== null) setLeftCollapsed(savedLeft === 'true');
    if (savedBottom !== null) setBottomCollapsed(savedBottom === 'true');
  }, []);

  const toggleLeftPanel = () => {
    setLeftCollapsed(prev => {
      localStorage.setItem('logicopt_left_collapsed', (!prev).toString());
      return !prev;
    });
    setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
  };

  const toggleBottomPanel = () => {
    setBottomCollapsed(prev => {
      localStorage.setItem('logicopt_bottom_collapsed', (!prev).toString());
      return !prev;
    });
    setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
  };

  // Check health and load examples on mount
  useEffect(() => {
    checkHealth();
    fetchExamples();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await axios.get('/api/health');
      setBackendHealthy(res.data.status === 'ok' && res.data.compiler_binary_found);
    } catch {
      setBackendHealthy(false);
    }
  };

  const fetchExamples = async () => {
    try {
      const res = await axios.get('/api/examples');
      setExamples(res.data || []);
    } catch (err) {
      console.error('Failed to fetch examples', err);
    }
  };

  // Initialize input valuation whenever a new compiler result arrives
  useEffect(() => {
    if (result && result.success) {
      const circuitInputs = result.originalCircuit?.inputs || [];
      const initVals = {};
      circuitInputs.forEach(inName => {
        initVals[inName] = 0;
      });
      setInputValuation(initVals);
    } else {
      setInputValuation({});
    }
  }, [result]);

  // Compile source code using C++ compiler backend
  const handleCompile = async () => {
    setIsCompiling(true);
    setResult(null); // Clear old circuit state immediately (Error-First behavior)
    try {
      const res = await axios.post('/api/compile', { source: code });
      setResult(res.data);
      if (!res.data.success || (res.data.errors && res.data.errors.length > 0)) {
        setActiveTab('errors');
        if (bottomCollapsed) setBottomCollapsed(false);
      }
    } catch (err) {
      setResult({
        success: false,
        errors: [{ type: 'NetworkError', message: 'Failed to connect to Python backend server. Ensure backend is running.', line: 1, column: 1 }],
        warnings: []
      });
      setActiveTab('errors');
      if (bottomCollapsed) setBottomCollapsed(false);
    } finally {
      setIsCompiling(false);
    }
  };

  // Initial compilation on startup
  useEffect(() => {
    handleCompile();
  }, []);

  // Handle example loading
  const handleSelectExample = (exampleId) => {
    setSelectedExample(exampleId);
    const found = examples.find((ex) => ex.id === exampleId);
    if (found) {
      setCode(found.code);
    }
  };

  // Toggle input value (0 -> 1 -> 0) in simulator
  const handleToggleInput = (inName) => {
    setInputValuation((prev) => ({
      ...prev,
      [inName]: prev[inName] ? 0 : 1
    }));
  };

  // Active circuit selection based on toggle tab
  const activeCircuit = circuitTab === 'optimized'
    ? result?.optimizedCircuit
    : circuitTab === 'nand'
    ? result?.nandCircuit
    : circuitTab === 'nor'
    ? result?.norCircuit
    : result?.originalCircuit;

  const activeIr = circuitTab === 'optimized'
    ? result?.optimizedIr
    : result?.ir;

  // Real-time evaluated signal propagation
  const evaluatedSignals = result && result.success
    ? evaluateCircuitSignals(activeCircuit, activeIr, inputValuation)
    : {};

  // Generate Verilog from compiler circuit graph
  const generateVerilog = (circuit, moduleName = 'optimized_circuit') => {
    if (!circuit || !circuit.gates) return '// No circuit graph available';

    let verilog = `module ${moduleName}(\n`;
    const inputs = circuit.inputs || [];
    const outputs = circuit.outputs || [];

    verilog += `  input wire ${inputs.join(', ')},\n`;
    verilog += `  output wire ${outputs.join(', ')}\n);\n\n`;

    const internalWires = circuit.gates
      .filter(g => g.type === 'WIRE')
      .map(g => g.id);

    if (internalWires.length > 0) {
      verilog += `  wire ${internalWires.join(', ')};\n\n`;
    }

    circuit.gates.forEach(g => {
      if (g.type === 'AND') verilog += `  assign ${g.outputs[0]} = ${g.inputs.join(' & ')};\n`;
      else if (g.type === 'OR') verilog += `  assign ${g.outputs[0]} = ${g.inputs.join(' | ')};\n`;
      else if (g.type === 'NOT') verilog += `  assign ${g.outputs[0]} = ~${g.inputs[0]};\n`;
      else if (g.type === 'XOR') verilog += `  assign ${g.outputs[0]} = ${g.inputs.join(' ^ ')};\n`;
      else if (g.type === 'NAND') verilog += `  assign ${g.outputs[0]} = ~(${g.inputs.join(' & ')});\n`;
      else if (g.type === 'NOR') verilog += `  assign ${g.outputs[0]} = ~(${g.inputs.join(' | ')});\n`;
      else if (g.type === 'XNOR') verilog += `  assign ${g.outputs[0]} = ~(${g.inputs.join(' ^ ')});\n`;
      else if (g.type === 'ASSIGN') verilog += `  assign ${g.outputs[0]} = ${g.inputs[0]};\n`;
    });

    verilog += `\nendmodule\n`;
    return verilog;
  };

  // Handle exports
  const handleExport = (type) => {
    let content = '';
    let filename = 'export.txt';
    let mime = 'text/plain';

    if (type === 'source') {
      content = code;
      filename = 'circuit.logic';
    } else if (type === 'json') {
      content = JSON.stringify(result, null, 2);
      filename = 'logicopt_result.json';
      mime = 'application/json';
    } else if (type === 'ir') {
      content = (result?.optimizedIr || []).map(i => `${i.result} = ${i.arg1} ${i.op} ${i.arg2}`).join('\n');
      filename = 'optimized_ir.tac';
    } else if (type === 'truth_table') {
      const tt = result?.truthTable;
      if (tt && tt.rows) {
        const headers = [...(tt.inputs || []), ...(tt.outputs || [])].join(',');
        const rowsStr = tt.rows.map(r => [
          ...(tt.inputs || []).map(i => r.inputs[i]),
          ...(tt.outputs || []).map(o => r.outputs[o])
        ].join(',')).join('\n');
        content = `${headers}\n${rowsStr}`;
        filename = 'truth_table.csv';
        mime = 'text/csv';
      }
    } else if (type === 'verilog') {
      content = generateVerilog(result?.optimizedCircuit);
      filename = 'optimized_circuit.v';
    }

    if (!content) return;

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'truthTable', label: 'Truth Table' },
    { id: 'kmap', label: 'K-Map Minimization' },
    { id: 'timing', label: 'Timing & Critical Path' },
    { id: 'verification', label: 'Equivalence Verification' },
    { id: 'metrics', label: 'Circuit Metrics' },
    { id: 'optimizations', label: 'Optimization Pass Log' },
    { id: 'ir', label: 'IR (TAC)' },
    { id: 'tokens', label: 'Tokens' },
    { id: 'ast', label: 'AST' },
    { id: 'symbolTable', label: 'Symbol Table' },
    {
      id: 'errors',
      label: 'Compiler Diagnostics',
      badge: (result?.errors?.length || 0) + (result?.warnings?.length || 0)
    }
  ];

  // Left Content: Source Code Editor & Language Help Panel
  const leftContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        height: '38px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 0.8rem',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>SOURCE CODE EDITOR</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={() => setShowHelp(!showHelp)}
            style={{
              background: 'none',
              border: 'none',
              color: showHelp ? 'var(--accent-blue)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}
          >
            {showHelp ? 'Hide Syntax Guide' : 'Syntax Guide'}
          </button>
          <button
            onClick={toggleLeftPanel}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            title="Collapse Left Panel"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
      </div>

      {showHelp && <LanguageHelpPanel onClose={() => setShowHelp(false)} />}

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Editor
          code={code}
          onChange={setCode}
          errors={result?.errors || []}
        />
      </div>
    </div>
  );

  // Right Content: Main Digital Circuit Simulator Canvas with Circuit Mode Switcher
  const rightContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Top Circuit Canvas Sub-Header */}
      <div style={{
        height: '38px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 0.8rem',
        fontSize: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {leftCollapsed && (
            <button
              onClick={toggleLeftPanel}
              style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              title="Expand Code Editor"
            >
              <PanelLeftOpen size={16} />
              <span style={{ fontWeight: '600', fontSize: '0.75rem' }}>Editor</span>
            </button>
          )}
          <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.82rem' }}>
            SYNTHESIZED DIGITAL CIRCUIT
          </span>
        </div>

        {/* Technology Mapping & Optimization Circuit Mode Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', background: 'var(--bg-darker)', borderRadius: '6px', padding: '2px' }}>
            <button
              className={`btn ${circuitTab === 'original' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCircuitTab('original')}
              style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem' }}
            >
              Original
            </button>
            <button
              className={`btn ${circuitTab === 'optimized' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCircuitTab('optimized')}
              style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem' }}
            >
              Optimized
            </button>
            <button
              className={`btn ${circuitTab === 'nand' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCircuitTab('nand')}
              style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem' }}
            >
              NAND-Only
            </button>
            <button
              className={`btn ${circuitTab === 'nor' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCircuitTab('nor')}
              style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem' }}
            >
              NOR-Only
            </button>
          </div>

          {bottomCollapsed && (
            <button
              onClick={toggleBottomPanel}
              style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.5rem' }}
              title="Expand Bottom Analysis Panel"
            >
              <PanelBottomOpen size={16} />
              <span style={{ fontWeight: '600', fontSize: '0.75rem' }}>Analysis</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Simulator Component */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <CircuitSimulator
          circuit={result?.success ? activeCircuit : null}
          title={
            circuitTab === 'optimized' ? "Optimized Digital Circuit" :
            circuitTab === 'nand' ? "NAND-Only Synthesized Netlist" :
            circuitTab === 'nor' ? "NOR-Only Synthesized Netlist" :
            "Original Synthesized Circuit"
          }
          compilationFailed={result && !result.success}
          errorMessage={result?.errors?.[0]?.message}
          evaluatedSignals={evaluatedSignals}
          showSignalValues={showSignalValues}
        />
      </div>
    </div>
  );

  // Bottom Content: Truth Table, K-Map, Timing, Verification, Metrics, Optimization Log, Diagnostics Tabs
  const bottomContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Bottom Panel Header Tabs & Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        paddingRight: '0.8rem'
      }}>
        <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '0.55rem 0.9rem',
                fontSize: '0.78rem',
                fontWeight: activeTab === t.id ? '600' : '500',
                color: activeTab === t.id ? 'var(--accent-blue)' : 'var(--text-muted)',
                background: activeTab === t.id ? 'var(--bg-darker)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === t.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{t.label}</span>
              {t.badge > 0 && (
                <span style={{
                  background: 'var(--accent-red)',
                  color: 'white',
                  fontSize: '0.68rem',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '9999px',
                  fontWeight: '700'
                }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={toggleBottomPanel}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          title="Collapse Bottom Panel"
        >
          <PanelBottomClose size={16} />
        </button>
      </div>

      {/* Tab Panel Contents */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-darker)' }}>
        {activeTab === 'truthTable' && (
          <TruthTableView
            truthTable={result?.truthTable}
            activeInputValuation={inputValuation}
            onSelectRow={(rowInputs) => setInputValuation(rowInputs)}
          />
        )}
        {activeTab === 'kmap' && (
          <KMapView kmap={result?.kmap} />
        )}
        {activeTab === 'timing' && (
          <CriticalPathView criticalPath={result?.criticalPath} />
        )}
        {activeTab === 'verification' && (
          <VerificationView verification={result?.verification} />
        )}
        {activeTab === 'metrics' && (
          <MetricsView metrics={result?.metrics} />
        )}
        {activeTab === 'optimizations' && (
          <OptimizationReportView optimizations={result?.optimizations} />
        )}
        {activeTab === 'ir' && (
          <IrView originalIr={result?.ir} optimizedIr={result?.optimizedIr} />
        )}
        {activeTab === 'tokens' && (
          <TokensView tokens={result?.tokens} />
        )}
        {activeTab === 'ast' && (
          <AstView ast={result?.ast} />
        )}
        {activeTab === 'symbolTable' && (
          <SymbolTableView symbolTable={result?.symbolTable} />
        )}
        {activeTab === 'errors' && (
          <ErrorView errors={result?.errors} warnings={result?.warnings} />
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-main)' }}>
      {/* Top IDE Header Toolbar */}
      <Header
        examples={examples}
        selectedExample={selectedExample}
        onSelectExample={handleSelectExample}
        onCompile={handleCompile}
        isCompiling={isCompiling}
        backendHealthy={backendHealthy}
        onExport={handleExport}
      />

      {/* Interactive Simulation Control Panel */}
      {result && result.success && (
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.2rem 0.8rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-purple)' }}>DIGITAL SIMULATION CONTROLS</span>
            <button
              onClick={() => setSimPanelCollapsed(!simPanelCollapsed)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              {simPanelCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
          {!simPanelCollapsed && (
            <SimulationPanel
              circuit={activeCircuit}
              inputValuation={inputValuation}
              onToggleInput={handleToggleInput}
              evaluatedSignals={evaluatedSignals}
              simulationActive={simulationActive}
              onToggleSimulation={() => setSimulationActive(!simulationActive)}
              showSignalValues={showSignalValues}
              onToggleSignalValues={() => setShowSignalValues(!showSignalValues)}
            />
          )}
        </div>
      )}

      {/* Main Collapsible & Resizable IDE Workspace Layout */}
      <ResizableLayout
        leftContent={leftContent}
        rightContent={rightContent}
        bottomContent={bottomContent}
        leftCollapsed={leftCollapsed}
        rightCollapsed={false}
        bottomCollapsed={bottomCollapsed}
        onToggleLeft={toggleLeftPanel}
        onToggleBottom={toggleBottomPanel}
      />
    </div>
  );
}

