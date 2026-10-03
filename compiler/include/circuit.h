#ifndef LOGICOPT_CIRCUIT_H
#define LOGICOPT_CIRCUIT_H

#include <string>
#include <vector>
#include <unordered_map>
#include <nlohmann/json.hpp>
#include "ir.h"
#include "symbol_table.h"

namespace logicopt {

struct CircuitGate {
    std::string id;
    std::string type;   // INPUT, CONSTANT, AND, OR, NOT, XOR, NAND, NOR, XNOR, OUTPUT, WIRE
    std::string label;
    std::vector<std::string> inputs;
    std::vector<std::string> outputs;
    int depth{0};

    nlohmann::json toJson() const {
        return {
            {"id", id},
            {"type", type},
            {"label", label},
            {"inputs", inputs},
            {"outputs", outputs},
            {"depth", depth}
        };
    }
};

struct CircuitGraph {
    std::vector<std::string> inputSignals;
    std::vector<std::string> outputSignals;
    std::vector<CircuitGate> gates;
    int totalDepth{0};

    nlohmann::json toJson() const {
        nlohmann::json gatesJson = nlohmann::json::array();
        for (const auto& g : gates) {
            gatesJson.push_back(g.toJson());
        }
        return {
            {"inputs", inputSignals},
            {"outputs", outputSignals},
            {"gates", gatesJson},
            {"depth", totalDepth}
        };
    }
};

class CircuitGenerator {
public:
    CircuitGenerator() = default;

    CircuitGraph generate(const std::vector<IRInstruction>& ir, const SymbolTable& symbolTable);

private:
    void calculateDepths(CircuitGraph& graph);
};

} // namespace logicopt

#endif
