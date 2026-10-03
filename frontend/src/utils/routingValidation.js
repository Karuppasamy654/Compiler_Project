// Automated Routing Validation Engine (Ensures 0 Wire-Obstacle Collisions & Valid Port Endpoints)

import { getGateObstacleBox, getGatePortCoordinates } from './geometry.js';
import { computeOrthogonalWirePath, pathIntersectsObstacles } from './orthogonalRouter.js';

export function validateCircuitRouting(circuit, positions) {
  if (!circuit || !circuit.gates) {
    return { valid: true, totalWires: 0, collisions: 0, errors: [] };
  }

  const visibleGates = circuit.gates.filter(g => g.type !== 'WIRE');
  const obstacles = visibleGates.map(g => getGateObstacleBox(g, positions[g.id] || { x: 0, y: 0 }));
  const portCoords = {};
  visibleGates.forEach(g => {
    portCoords[g.id] = getGatePortCoordinates(g, positions[g.id] || { x: 0, y: 0 });
  });

  // Resolve source gate ID bypassing intermediate WIRE nodes
  const resolveSourceGateId = (srcId) => {
    let curr = srcId;
    let limit = 10;
    while (limit-- > 0) {
      const found = circuit.gates.find(g => g.id === curr);
      if (found && found.type === 'WIRE' && found.inputs && found.inputs.length > 0) {
        curr = found.inputs[0];
      } else {
        break;
      }
    }
    return curr;
  };

  let totalWires = 0;
  let collisions = 0;
  const errors = [];

  visibleGates.forEach(dstGate => {
    if (!dstGate.inputs) return;

    dstGate.inputs.forEach((inpId, inIdx) => {
      const actualSrcId = resolveSourceGateId(inpId);
      const srcPortData = portCoords[actualSrcId];
      const dstPortData = portCoords[dstGate.id];

      if (srcPortData && dstPortData) {
        totalWires++;
        const srcPort = srcPortData.outputPort;
        const dstPort = dstPortData.inputPorts[inIdx] || dstPortData.inputPorts[0];

        const route = computeOrthogonalWirePath(srcPort, dstPort, obstacles, actualSrcId, dstGate.id);

        if (pathIntersectsObstacles(route.points, obstacles, [actualSrcId, dstGate.id])) {
          collisions++;
          errors.push(`Collision detected on wire ${actualSrcId} -> ${dstGate.id}`);
        }
      }
    }
  });

  return {
    valid: collisions === 0,
    totalWires,
    collisions,
    errors
  };
}
