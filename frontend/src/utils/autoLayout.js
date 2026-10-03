// Topology-Aware Auto-Layout Algorithm with Crossing Minimization

import { LAYOUT_CONSTANTS } from './geometry.js';

/**
 * Computes deterministic (x, y) coordinates for all gate nodes based on topological depth & barycenter sorting.
 */
export function computeTopologyAutoLayout(circuit) {
  if (!circuit || !circuit.gates || circuit.gates.length === 0) {
    return {};
  }

  const visibleGates = circuit.gates.filter(g => g.type !== 'WIRE');
  const maxDepth = circuit.depth || 0;

  // Group gates by topological depth level
  const depthGroups = {};
  visibleGates.forEach(gate => {
    let d = gate.depth || 0;
    if (gate.type === 'OUTPUT') {
      d = maxDepth + 1;
    }
    if (!depthGroups[d]) depthGroups[d] = [];
    depthGroups[d].push(gate);
  });

  const positions = {};
  const depthKeys = Object.keys(depthGroups).map(Number).sort((a, b) => a - b);

  // Layer 0: Order INPUTs & CONSTANTs
  if (depthGroups[depthKeys[0]]) {
    depthGroups[depthKeys[0]].sort((a, b) => (a.id > b.id ? 1 : -1));
  }

  // Barycenter Vertical Reordering (Layers 1..N): Minimize wire crossings
  for (let idx = 1; idx < depthKeys.length; ++idx) {
    const layer = depthKeys[idx];
    const gatesInLayer = depthGroups[layer];

    gatesInLayer.forEach(gate => {
      // Calculate barycenter (avg Y) of input signals feeding this gate
      if (gate.inputs && gate.inputs.length > 0) {
        let sumY = 0;
        let count = 0;
        gate.inputs.forEach(inId => {
          if (positions[inId]) {
            sumY += positions[inId].y;
            count++;
          }
        });
        gate._barycenter = count > 0 ? sumY / count : 0;
      } else {
        gate._barycenter = 0;
      }
    });

    gatesInLayer.sort((a, b) => a._barycenter - b._barycenter);
  }

  // Assign final X and Y pixel positions
  depthKeys.forEach(layer => {
    const gatesInLayer = depthGroups[layer];
    const colX = LAYOUT_CONSTANTS.MARGIN_X + layer * LAYOUT_CONSTANTS.NODE_HORIZONTAL_GAP;

    gatesInLayer.forEach((gate, rowIdx) => {
      const rowY = LAYOUT_CONSTANTS.MARGIN_Y + rowIdx * LAYOUT_CONSTANTS.NODE_VERTICAL_GAP;
      positions[gate.id] = { x: colX, y: rowY };
    });
  });

  return positions;
}
