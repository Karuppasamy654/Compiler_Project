// Geometry & Port Constants for Digital Logic Circuit Visualization

export const LAYOUT_CONSTANTS = {
  NODE_HORIZONTAL_GAP: 240,
  NODE_VERTICAL_GAP: 120,
  MARGIN_X: 80,
  MARGIN_Y: 60,
  OBSTACLE_PADDING: 20, // Padding around gate bounding boxes for wire routing
  DEFAULT_GATE_WIDTH: 65,
  DEFAULT_GATE_HEIGHT: 50,
  INPUT_GATE_WIDTH: 55,
  OUTPUT_GATE_WIDTH: 55,
  CONSTANT_GATE_WIDTH: 45,
  LABEL_BOTTOM_OFFSET: 20
};

/**
 * Returns the exact dimensions and bounding box of a gate node.
 */
export function getGateDimensions(type) {
  let width = LAYOUT_CONSTANTS.DEFAULT_GATE_WIDTH;
  let height = LAYOUT_CONSTANTS.DEFAULT_GATE_HEIGHT;

  if (type === 'INPUT') {
    width = LAYOUT_CONSTANTS.INPUT_GATE_WIDTH;
    height = 36;
  } else if (type === 'OUTPUT') {
    width = LAYOUT_CONSTANTS.OUTPUT_GATE_WIDTH;
    height = 36;
  } else if (type === 'CONSTANT') {
    width = LAYOUT_CONSTANTS.CONSTANT_GATE_WIDTH;
    height = 36;
  } else if (type === 'NAND' || type === 'NOR' || type === 'XNOR') {
    width = 70; // extra width for bubble
  }

  return { width, height };
}

/**
 * Returns the obstacle bounding rectangle (expanded by padding) for a gate node at (x, y).
 */
export function getGateObstacleBox(gate, pos) {
  const { width, height } = getGateDimensions(gate.type);
  const padding = LAYOUT_CONSTANTS.OBSTACLE_PADDING;
  const labelHeight = (gate.type !== 'INPUT' && gate.type !== 'OUTPUT' && gate.type !== 'CONSTANT') ? 18 : 0;

  return {
    id: gate.id,
    x1: pos.x - padding,
    y1: pos.y - padding,
    x2: pos.x + width + padding,
    y2: pos.y + height + labelHeight + padding,
    gateX1: pos.x,
    gateY1: pos.y,
    gateX2: pos.x + width,
    gateY2: pos.y + height + labelHeight
  };
}

/**
 * Calculates exact port coordinates for a gate node at position (x, y).
 */
export function getGatePortCoordinates(gate, pos) {
  const { width, height } = getGateDimensions(gate.type);
  const { x, y } = pos;

  const inputs = gate.inputs || [];
  const inputPorts = [];

  if (gate.type === 'INPUT' || gate.type === 'CONSTANT') {
    // Inputs/Constants have no input ports
  } else if (gate.type === 'NOT' || gate.type === 'OUTPUT') {
    inputPorts.push({
      id: `${gate.id}_in_0`,
      index: 0,
      x: x,
      y: y + 20,
      side: 'LEFT'
    });
  } else {
    // 2-input or multi-input logic gates
    const numInputs = Math.max(inputs.length, 2);
    if (numInputs === 2) {
      inputPorts.push({ id: `${gate.id}_in_0`, index: 0, x: x, y: y + 15, side: 'LEFT' });
      inputPorts.push({ id: `${gate.id}_in_1`, index: 1, x: x, y: y + 35, side: 'LEFT' });
    } else {
      for (let i = 0; i < numInputs; ++i) {
        const py = y + 10 + (30 * i) / (numInputs - 1);
        inputPorts.push({ id: `${gate.id}_in_${i}`, index: i, x: x, y: py, side: 'LEFT' });
      }
    }
  }

  // Output port
  let outX = x + width;
  let outY = y + 25;
  if (gate.type === 'INPUT' || gate.type === 'OUTPUT' || gate.type === 'CONSTANT') {
    outY = y + 20;
  } else if (gate.type === 'NOT') {
    outY = y + 25;
    outX = x + 62;
  }

  const outputPort = {
    id: `${gate.id}_out_0`,
    index: 0,
    x: outX,
    y: outY,
    side: 'RIGHT'
  };

  return {
    id: gate.id,
    x,
    y,
    width,
    height,
    inputPorts,
    outputPort
  };
}

/**
 * Checks if a line segment (x1, y1) -> (x2, y2) intersects an obstacle box.
 */
export function segmentIntersectsBox(x1, y1, x2, y2, box) {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  // Quick bounding box check
  if (maxX <= box.x1 || minX >= box.x2 || maxY <= box.y1 || minY >= box.y2) {
    return false;
  }

  // Segment is horizontal
  if (y1 === y2) {
    return y1 >= box.y1 && y1 <= box.y2 && maxX > box.x1 && minX < box.x2;
  }

  // Segment is vertical
  if (x1 === x2) {
    return x1 >= box.x1 && x1 <= box.x2 && maxY > box.y1 && minY < box.y2;
  }

  return true;
}
