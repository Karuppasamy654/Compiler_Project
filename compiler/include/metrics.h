#ifndef LOGICOPT_METRICS_H
#define LOGICOPT_METRICS_H

#include <string>
#include <unordered_map>
#include <nlohmann/json.hpp>
#include "circuit.h"

namespace logicopt {

struct SingleCircuitMetrics {
    int totalGates{0};
    int andGates{0};
    int orGates{0};
    int notGates{0};
    int xorGates{0};
    int nandGates{0};
    int norGates{0};
    int xnorGates{0};

    int totalInputs{0};
    int totalOutputs{0};
    int totalWires{0};
    int intermediateSignals{0};
    int circuitDepth{0};

    nlohmann::json toJson() const {
        return {
            {"totalGates", totalGates},
            {"andGates", andGates},
            {"orGates", orGates},
            {"notGates", notGates},
            {"xorGates", xorGates},
            {"nandGates", nandGates},
            {"norGates", norGates},
            {"xnorGates", xnorGates},
            {"totalInputs", totalInputs},
            {"totalOutputs", totalOutputs},
            {"totalWires", totalWires},
            {"intermediateSignals", intermediateSignals},
            {"circuitDepth", circuitDepth}
        };
    }
};

struct CompilerMetrics {
    SingleCircuitMetrics original;
    SingleCircuitMetrics optimized;

    int gateReduction{0};
    double gateReductionPercentage{0.0};
    int depthReduction{0};
    double depthReductionPercentage{0.0};

    nlohmann::json toJson() const {
        return {
            {"original", original.toJson()},
            {"optimized", optimized.toJson()},
            {"gateReduction", gateReduction},
            {"gateReductionPercentage", gateReductionPercentage},
            {"depthReduction", depthReduction},
            {"depthReductionPercentage", depthReductionPercentage}
        };
    }
};

class MetricsCalculator {
public:
    MetricsCalculator() = default;

    SingleCircuitMetrics calculateSingle(const CircuitGraph& graph);
    CompilerMetrics calculateComparison(const CircuitGraph& original, const CircuitGraph& optimized);
};

} // namespace logicopt

#endif
