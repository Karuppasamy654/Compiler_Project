#include "circuit.h"
#include <algorithm>
#include <queue>

namespace logicopt {

CircuitGraph CircuitGenerator::generate(const std::vector<IRInstruction>& ir, const SymbolTable& symbolTable) {
    CircuitGraph graph;
    std::unordered_map<std::string, size_t> gateMap;

    auto addOrGetGate = [&](const std::string& id, const std::string& type, const std::string& label) -> size_t {
        auto it = gateMap.find(id);
        if (it != gateMap.end()) {
            return it->second;
        }
        size_t idx = graph.gates.size();
        graph.gates.push_back(CircuitGate{id, type, label, {}, {}, 0});
        gateMap[id] = idx;
        return idx;
    };

    // 1. Add input signals from symbol table
    for (const auto& pair : symbolTable.getSymbols()) {
        if (pair.second.kind == SymbolKind::INPUT) {
            graph.inputSignals.push_back(pair.first);
            addOrGetGate(pair.first, "INPUT", pair.first);
        } else if (pair.second.kind == SymbolKind::OUTPUT) {
            graph.outputSignals.push_back(pair.first);
        }
    }

    // 2. Process IR instructions
    int gateCount = 1;
    for (const auto& inst : ir) {
        if (inst.op == "ASSIGN") {
            // Signal aliasing/pass-through or constant assignment
            size_t srcIdx = addOrGetGate(inst.arg1, (inst.arg1 == "0" || inst.arg1 == "1") ? "CONSTANT" : "WIRE", inst.arg1);
            size_t dstIdx = addOrGetGate(inst.result, (symbolTable.exists(inst.result) && symbolTable.lookup(inst.result)->kind == SymbolKind::OUTPUT) ? "OUTPUT" : "WIRE", inst.result);

            graph.gates[dstIdx].inputs.push_back(inst.arg1);
            graph.gates[srcIdx].outputs.push_back(inst.result);
        } else {
            std::string gateId = "G" + std::to_string(gateCount++);
            size_t gIdx = addOrGetGate(gateId, inst.op, inst.op);

            // Connect arg1
            if (!inst.arg1.empty()) {
                size_t arg1Idx = addOrGetGate(inst.arg1, (inst.arg1 == "0" || inst.arg1 == "1") ? "CONSTANT" : "WIRE", inst.arg1);
                graph.gates[gIdx].inputs.push_back(inst.arg1);
                graph.gates[arg1Idx].outputs.push_back(gateId);
            }

            // Connect arg2
            if (!inst.arg2.empty()) {
                size_t arg2Idx = addOrGetGate(inst.arg2, (inst.arg2 == "0" || inst.arg2 == "1") ? "CONSTANT" : "WIRE", inst.arg2);
                graph.gates[gIdx].inputs.push_back(inst.arg2);
                graph.gates[arg2Idx].outputs.push_back(gateId);
            }

            // Connect result
            size_t resIdx = addOrGetGate(inst.result, (symbolTable.exists(inst.result) && symbolTable.lookup(inst.result)->kind == SymbolKind::OUTPUT) ? "OUTPUT" : "WIRE", inst.result);
            graph.gates[gIdx].outputs.push_back(inst.result);
            graph.gates[resIdx].inputs.push_back(gateId);
        }
    }

    calculateDepths(graph);
    return graph;
}

void CircuitGenerator::calculateDepths(CircuitGraph& graph) {
    std::unordered_map<std::string, int> depths;
    std::unordered_map<std::string, int> inDegree;
    std::unordered_map<std::string, std::vector<std::string>> adj;

    for (const auto& g : graph.gates) {
        depths[g.id] = 0;
        inDegree[g.id] = static_cast<int>(g.inputs.size());
        for (const auto& inp : g.inputs) {
            adj[inp].push_back(g.id);
        }
    }

    std::queue<std::string> q;
    for (const auto& g : graph.gates) {
        if (g.type == "INPUT" || g.type == "CONSTANT") {
            q.push(g.id);
            depths[g.id] = 0;
        }
    }

    int maxD = 0;
    while (!q.empty()) {
        std::string curr = q.front();
        q.pop();

        int currDepth = depths[curr];
        if (currDepth > maxD) maxD = currDepth;

        for (const auto& nextId : adj[curr]) {
            int gateCost = (graph.gates[0].id == nextId) ? 0 : 1;
            // Check if nextId is a logic gate (AND, OR, NOT, etc.)
            for (const auto& g : graph.gates) {
                if (g.id == nextId) {
                    if (g.type == "INPUT" || g.type == "OUTPUT" || g.type == "WIRE" || g.type == "CONSTANT") {
                        gateCost = 0;
                    } else {
                        gateCost = 1;
                    }
                    break;
                }
            }

            if (currDepth + gateCost > depths[nextId]) {
                depths[nextId] = currDepth + gateCost;
            }

            inDegree[nextId]--;
            if (inDegree[nextId] <= 0) {
                q.push(nextId);
            }
        }
    }

    graph.totalDepth = maxD;
    for (auto& g : graph.gates) {
        g.depth = depths[g.id];
    }
}

} // namespace logicopt
