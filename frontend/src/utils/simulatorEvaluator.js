// Evaluates the circuit graph / IR for user-selected primary input values
export function evaluateCircuitSignals(circuit, ir, inputValuation) {
  const env = { ...inputValuation, "0": 0, "1": 1 };

  const getValue = (arg) => {
    if (arg === "0") return 0;
    if (arg === "1") return 1;
    if (env[arg] !== undefined) return env[arg];
    return 0;
  };

  // 1. Evaluate via IR instructions if available
  if (ir && ir.length > 0) {
    ir.forEach((inst) => {
      const v1 = getValue(inst.arg1);
      const v2 = getValue(inst.arg2);

      switch (inst.op) {
        case "ASSIGN":
          env[inst.result] = v1;
          break;
        case "NOT":
          env[inst.result] = v1 ? 0 : 1;
          break;
        case "AND":
          env[inst.result] = (v1 && v2) ? 1 : 0;
          break;
        case "OR":
          env[inst.result] = (v1 || v2) ? 1 : 0;
          break;
        case "XOR":
          env[inst.result] = (v1 ^ v2) ? 1 : 0;
          break;
        case "NAND":
          env[inst.result] = !(v1 && v2) ? 1 : 0;
          break;
        case "NOR":
          env[inst.result] = !(v1 || v2) ? 1 : 0;
          break;
        case "XNOR":
          env[inst.result] = !(v1 ^ v2) ? 1 : 0;
          break;
        default:
          env[inst.result] = v1;
      }
    });
  } else if (circuit && circuit.gates) {
    // 2. Fallback: evaluate directly on circuit gate nodes in topological depth order
    const sortedGates = [...circuit.gates].sort((a, b) => (a.depth || 0) - (b.depth || 0));

    sortedGates.forEach((gate) => {
      if (gate.type === "INPUT") {
        env[gate.id] = getValue(gate.label || gate.id);
      } else if (gate.type === "CONSTANT") {
        env[gate.id] = (gate.label === "1" || gate.id === "1") ? 1 : 0;
      } else {
        const inVals = gate.inputs.map(inpId => getValue(inpId));
        const v1 = inVals[0] || 0;
        const v2 = inVals[1] || 0;
        let res = 0;

        switch (gate.type) {
          case "AND": res = (v1 && v2) ? 1 : 0; break;
          case "OR": res = (v1 || v2) ? 1 : 0; break;
          case "NOT": res = v1 ? 0 : 1; break;
          case "XOR": res = (v1 ^ v2) ? 1 : 0; break;
          case "NAND": res = !(v1 && v2) ? 1 : 0; break;
          case "NOR": res = !(v1 || v2) ? 1 : 0; break;
          case "XNOR": res = !(v1 ^ v2) ? 1 : 0; break;
          case "WIRE":
          case "OUTPUT":
            res = v1;
            break;
          default:
            res = v1;
        }

        env[gate.id] = res;
        if (gate.outputs && gate.outputs.length > 0) {
          gate.outputs.forEach(outId => {
            env[outId] = res;
          });
        }
      }
    });
  }

  return env;
}
