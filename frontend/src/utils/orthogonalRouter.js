// Obstacle-Aware Orthogonal Wire Pathfinder & Channel Router

import { segmentIntersectsBox } from './geometry.js';

/**
 * Checks if a multi-segment path intersects any obstacle box in the list.
 */
export function pathIntersectsObstacles(path, obstacles, ignoreIds = []) {
  if (!path || path.length < 2) return false;

  for (let i = 0; i < path.length - 1; ++i) {
    const p1 = path[i];
    const p2 = path[i + 1];

    for (const obs of obstacles) {
      if (ignoreIds.includes(obs.id)) continue;
      if (segmentIntersectsBox(p1.x, p1.y, p2.x, p2.y, obs)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Generates an obstacle-avoiding orthogonal SVG path data string (e.g. "M x1 y1 L x2 y2 ...")
 * for a connection between srcPort and dstPort.
 */
export function computeOrthogonalWirePath(srcPort, dstPort, obstacles = [], srcGateId = null, dstGateId = null) {
  const ignoreIds = [srcGateId, dstGateId].filter(Boolean);
  const x1 = srcPort.x;
  const y1 = srcPort.y;
  const x2 = dstPort.x;
  const y2 = dstPort.y;

  const minExitMargin = 15;
  const exitX = Math.max(x1 + minExitMargin, x1 + (x2 - x1) * 0.2);
  const entryX = Math.min(x2 - minExitMargin, x2 - (x2 - x1) * 0.2);

  // Strategy 1: Standard 3-segment orthogonal route (Exit -> MidX -> Entry)
  let midX = (x1 + x2) / 2;
  if (x2 > x1 + 40) {
    midX = x1 + (x2 - x1) * 0.5;
  } else {
    midX = exitX;
  }

  const candidate3Seg = [
    { x: x1, y: y1 },
    { x: midX, y: y1 },
    { x: midX, y: y2 },
    { x: x2, y: y2 }
  ];

  if (!pathIntersectsObstacles(candidate3Seg, obstacles, ignoreIds)) {
    return { points: candidate3Seg, pathData: buildSvgPathData(candidate3Seg) };
  }

  // Strategy 2: 5-segment Obstacle Detour Route (Top or Bottom around blocking gates)
  // Identify blocking obstacles
  let maxObstacleY2 = -Infinity;
  let minObstacleY1 = Infinity;
  let blockingBox = null;

  for (const obs of obstacles) {
    if (ignoreIds.includes(obs.id)) continue;
    if (segmentIntersectsBox(midX, Math.min(y1, y2), midX, Math.max(y1, y2), obs) ||
        segmentIntersectsBox(x1, y1, x2, y2, obs)) {
      if (obs.y2 > maxObstacleY2) maxObstacleY2 = obs.y2;
      if (obs.y1 < minObstacleY1) minObstacleY1 = obs.y1;
      blockingBox = obs;
    }
  }

  if (blockingBox) {
    // Try Top Detour
    const topY = Math.min(minObstacleY1 - 25, Math.min(y1, y2) - 25);
    const topPath = [
      { x: x1, y: y1 },
      { x: exitX, y: y1 },
      { x: exitX, y: topY },
      { x: entryX, y: topY },
      { x: entryX, y: y2 },
      { x: x2, y: y2 }
    ];

    if (!pathIntersectsObstacles(topPath, obstacles, ignoreIds)) {
      return { points: topPath, pathData: buildSvgPathData(topPath) };
    }

    // Try Bottom Detour
    const bottomY = Math.max(maxObstacleY2 + 25, Math.max(y1, y2) + 25);
    const bottomPath = [
      { x: x1, y: y1 },
      { x: exitX, y: y1 },
      { x: exitX, y: bottomY },
      { x: entryX, y: bottomY },
      { x: entryX, y: y2 },
      { x: x2, y: y2 }
    ];

    if (!pathIntersectsObstacles(bottomPath, obstacles, ignoreIds)) {
      return { points: bottomPath, pathData: buildSvgPathData(bottomPath) };
    }
  }

  // Fallback: Clean orthogonal 4-segment path
  const fallbackPath = [
    { x: x1, y: y1 },
    { x: exitX, y: y1 },
    { x: exitX, y: y2 },
    { x: x2, y: y2 }
  ];

  return { points: fallbackPath, pathData: buildSvgPathData(fallbackPath) };
}

/**
 * Converts array of point objects [{x, y}, ...] into SVG path string "M x y L x y ...".
 */
export function buildSvgPathData(points) {
  if (!points || points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; ++i) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}

/**
 * Calculates Fan-Out branch points & junction dots (●) for signals that feed into multiple target gates.
 */
export function computeFanOutJunctions(wiresWithPaths) {
  const sourceGroups = {};

  // Group wires by source output port
  wiresWithPaths.forEach(w => {
    const key = `${w.srcId}:${w.signalName}`;
    if (!sourceGroups[key]) sourceGroups[key] = [];
    sourceGroups[key].push(w);
  });

  const junctions = [];

  Object.keys(sourceGroups).forEach(key => {
    const group = sourceGroups[key];
    if (group.length > 1) {
      // Multiple destinations from same source -> Calculate branch point
      const p0 = group[0].points;
      if (p0 && p0.length >= 2) {
        // Junction dot placed at initial branch split point on output trunk line
        const branchPt = p0[1] || p0[0];
        junctions.push({
          id: `junc_${key}`,
          x: branchPt.x,
          y: branchPt.y,
          signalName: group[0].signalName,
          srcId: group[0].srcId
        });
      }
    }
  });

  return junctions;
}
