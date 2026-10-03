#include "critical_path.h"
#include <algorithm>
#include <unordered_set>

namespace logicopt {

// Estimated propagation delay per gate type (in nanoseconds)
static double getGateDelay(const std::string& type) {
    if (type == "NOT") return 0.5;
    if (type == "AND" || type == "NAND") return 1.0;
    if (type == "OR" || type == "NOR") return 1.0;
    if (type == "XOR" || type == "XNOR") return 1.8;
    return 0.1; // WIRE, INPUT, OUTPUT
}

CriticalPathAnalysis CriticalPathAnalyzer::analyze(const CircuitGraph& graph) {
    CriticalPathAnalysis result;
    if (graph.gates.empty()) return result;

    // 1. Calculate Fan-In and Fan-Out for every gate node
    std::unordered_map<std::string, const CircuitGate*> gateMap;
    for (const auto& g : graph.gates) {
        gateMap[g.id] = &g;
        result.gateFanIn[g.id] = static_cast<int>(g.inputs.size());
        result.gateFanOut[g.id] = 0;
        if (result.gateFanIn[g.id] > result.maxFanIn) {
            result.maxFanIn = result.gateFanIn[g.id];
        }
    }

    for (const auto& g : graph.gates) {
        for (const auto& inSig : g.inputs) {
            if (gateMap.find(inSig) != gateMap.end()) {
                result.gateFanOut[inSig]++;
                if (result.gateFanOut[inSig] > result.maxFanOut) {
                    result.maxFanOut = result.gateFanOut[inSig];
                }
            }
        }
    }

    // 2. Find longest cumulative delay path to output nodes
    std::unordered_map<std::string, double> cumulativeDelay;
    std::unordered_map<std::string, std::string> parentNode;

    // Topological traversal
    std::vector<CircuitGate> sortedGates = graph.gates;
    std::sort(sortedGates.begin(), sortedGates.end(), [](const CircuitGate& a, const CircuitGate& b) {
        return a.depth < b.depth;
    });

    for (const auto& g : sortedGates) {
        double currentGateDelay = getGateDelay(g.type);
        double maxParentDelay = 0.0;
        std::string bestParent = "";

        for (const auto& inId : g.inputs) {
            auto it = cumulativeDelay.find(inId);
            if (it != cumulativeDelay.end()) {
                if (it->second > maxParentDelay) {
                    maxParentDelay = it->second;
                    bestParent = inId;
                }
            }
        }

        cumulativeDelay[g.id] = maxParentDelay + currentGateDelay;
        if (!bestParent.empty()) {
            parentNode[g.id] = bestParent;
        }
    }

    // 3. Identify output node with maximum accumulated delay
    double maxDelay = -1.0;
    std::string criticalOutGateId = "";

    for (const auto& g : graph.gates) {
        if (g.type == "OUTPUT") {
            if (cumulativeDelay[g.id] > maxDelay) {
                maxDelay = cumulativeDelay[g.id];
                criticalOutGateId = g.id;
            }
        }
    }

    if (criticalOutGateId.empty() && !sortedGates.empty()) {
        criticalOutGateId = sortedGates.back().id;
        maxDelay = cumulativeDelay[criticalOutGateId];
    }

    result.criticalOutput = criticalOutGateId;
    result.estimatedDelayNs = maxDelay > 0 ? maxDelay : 0.0;
    result.totalDepth = graph.totalDepth;

    // 4. Backtrack to trace critical path gate sequence
    std::string curr = criticalOutGateId;
    while (!curr.empty()) {
        result.criticalPathGates.push_back(curr);
        auto pit = parentNode.find(curr);
        if (pit != parentNode.end()) {
            curr = pit->second;
        } else {
            break;
        }
    }
    std::reverse(result.criticalPathGates.begin(), result.criticalPathGates.end());

    return result;
}

} // namespace logicopt
