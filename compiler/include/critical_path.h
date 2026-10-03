#ifndef LOGICOPT_CRITICAL_PATH_H
#define LOGICOPT_CRITICAL_PATH_H

#include <string>
#include <vector>
#include <unordered_map>
#include <nlohmann/json.hpp>
#include "circuit.h"

namespace logicopt {

struct CriticalPathAnalysis {
    int totalDepth{0};
    double estimatedDelayNs{0.0};
    std::string criticalOutput;
    std::vector<std::string> criticalPathGates; // List of gate IDs along longest path
    std::unordered_map<std::string, int> gateFanIn;
    std::unordered_map<std::string, int> gateFanOut;
    int maxFanIn{0};
    int maxFanOut{0};

    nlohmann::json toJson() const {
        return {
            {"totalDepth", totalDepth},
            {"estimatedDelayNs", estimatedDelayNs},
            {"criticalOutput", criticalOutput},
            {"criticalPathGates", criticalPathGates},
            {"gateFanIn", gateFanIn},
            {"gateFanOut", gateFanOut},
            {"maxFanIn", maxFanIn},
            {"maxFanOut", maxFanOut}
        };
    }
};

class CriticalPathAnalyzer {
public:
    CriticalPathAnalyzer() = default;

    // Calculates topological depth, longest critical path, estimated gate delay, and fan-in/fan-out metrics
    CriticalPathAnalysis analyze(const CircuitGraph& graph);
};

} // namespace logicopt

#endif
