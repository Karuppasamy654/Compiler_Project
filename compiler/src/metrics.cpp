#include "metrics.h"
#include <cmath>

namespace logicopt {

SingleCircuitMetrics MetricsCalculator::calculateSingle(const CircuitGraph& graph) {
    SingleCircuitMetrics m;
    m.totalInputs = static_cast<int>(graph.inputSignals.size());
    m.totalOutputs = static_cast<int>(graph.outputSignals.size());
    m.circuitDepth = graph.totalDepth;

    for (const auto& g : graph.gates) {
        if (g.type == "AND") m.andGates++;
        else if (g.type == "OR") m.orGates++;
        else if (g.type == "NOT") m.notGates++;
        else if (g.type == "XOR") m.xorGates++;
        else if (g.type == "NAND") m.nandGates++;
        else if (g.type == "NOR") m.norGates++;
        else if (g.type == "XNOR") m.xnorGates++;
        else if (g.type == "WIRE") m.intermediateSignals++;
    }

    m.totalGates = m.andGates + m.orGates + m.notGates + m.xorGates + m.nandGates + m.norGates + m.xnorGates;
    m.totalWires = m.intermediateSignals + m.totalInputs + m.totalOutputs;

    return m;
}

CompilerMetrics MetricsCalculator::calculateComparison(const CircuitGraph& original, const CircuitGraph& optimized) {
    CompilerMetrics cm;
    cm.original = calculateSingle(original);
    cm.optimized = calculateSingle(optimized);

    cm.gateReduction = cm.original.totalGates - cm.optimized.totalGates;
    if (cm.original.totalGates > 0) {
        cm.gateReductionPercentage = (static_cast<double>(cm.gateReduction) / cm.original.totalGates) * 100.0;
        if (cm.gateReductionPercentage < 0.0) cm.gateReductionPercentage = 0.0;
    } else {
        cm.gateReductionPercentage = 0.0;
    }

    cm.depthReduction = cm.original.circuitDepth - cm.optimized.circuitDepth;
    if (cm.original.circuitDepth > 0) {
        cm.depthReductionPercentage = (static_cast<double>(cm.depthReduction) / cm.original.circuitDepth) * 100.0;
        if (cm.depthReductionPercentage < 0.0) cm.depthReductionPercentage = 0.0;
    } else {
        cm.depthReductionPercentage = 0.0;
    }

    return cm;
}

} // namespace logicopt
