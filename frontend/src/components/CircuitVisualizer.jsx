import React from 'react';
import CircuitSimulator from './CircuitSimulator.jsx';

/**
 * CircuitVisualizer component wrapper ensuring unified professional circuit rendering.
 */
export default function CircuitVisualizer({ circuit, title, compilationFailed, errorMessage }) {
  return (
    <CircuitSimulator
      circuit={circuit}
      title={title || "Digital Logic Circuit"}
      compilationFailed={compilationFailed}
      errorMessage={errorMessage}
      evaluatedSignals={{}}
      showSignalValues={false}
    />
  );
}
