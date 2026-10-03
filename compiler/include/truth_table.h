#ifndef LOGICOPT_TRUTH_TABLE_H
#define LOGICOPT_TRUTH_TABLE_H

#include <string>
#include <vector>
#include <unordered_map>
#include <nlohmann/json.hpp>
#include "ir.h"
#include "symbol_table.h"

namespace logicopt {

struct TruthTableRow {
    std::unordered_map<std::string, int> inputValues;
    std::unordered_map<std::string, int> outputValues;

    nlohmann::json toJson(const std::vector<std::string>& inOrder, const std::vector<std::string>& outOrder) const {
        nlohmann::json inObj = nlohmann::json::object();
        for (const auto& k : inOrder) {
            auto it = inputValues.find(k);
            inObj[k] = (it != inputValues.end()) ? it->second : 0;
        }
        nlohmann::json outObj = nlohmann::json::object();
        for (const auto& k : outOrder) {
            auto it = outputValues.find(k);
            outObj[k] = (it != outputValues.end()) ? it->second : 0;
        }
        return {
            {"inputs", inObj},
            {"outputs", outObj}
        };
    }
};

struct TruthTable {
    std::vector<std::string> inputSignals;
    std::vector<std::string> outputSignals;
    std::vector<TruthTableRow> rows;
    bool skipped{false};
    std::string skipReason;

    nlohmann::json toJson() const {
        nlohmann::json rowsJson = nlohmann::json::array();
        for (const auto& r : rows) {
            rowsJson.push_back(r.toJson(inputSignals, outputSignals));
        }
        return {
            {"inputs", inputSignals},
            {"outputs", outputSignals},
            {"rows", rowsJson},
            {"skipped", skipped},
            {"skipReason", skipReason}
        };
    }
};

class TruthTableEvaluator {
public:
    explicit TruthTableEvaluator(int maxExhaustiveInputs = 10);

    TruthTable evaluate(const std::vector<IRInstruction>& ir, const SymbolTable& symbolTable);

    // Evaluate single input valuation on IR instructions
    static std::unordered_map<std::string, int> evaluateSingle(
        const std::vector<IRInstruction>& ir,
        const std::unordered_map<std::string, int>& inputValuation);

private:
    int maxExhaustiveInputs_;
};

} // namespace logicopt

#endif
