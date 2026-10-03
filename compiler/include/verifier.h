#ifndef LOGICOPT_VERIFIER_H
#define LOGICOPT_VERIFIER_H

#include <string>
#include <vector>
#include <unordered_map>
#include <nlohmann/json.hpp>
#include "ir.h"
#include "symbol_table.h"
#include "truth_table.h"

namespace logicopt {

struct CounterExample {
    std::unordered_map<std::string, int> inputValuation;
    std::unordered_map<std::string, int> originalOutputs;
    std::unordered_map<std::string, int> optimizedOutputs;
    std::string mismatchedOutput;

    nlohmann::json toJson(const std::vector<std::string>& inOrder, const std::vector<std::string>& outOrder) const {
        nlohmann::json inObj = nlohmann::json::object();
        for (const auto& k : inOrder) {
            auto it = inputValuation.find(k);
            inObj[k] = (it != inputValuation.end()) ? it->second : 0;
        }
        nlohmann::json origObj = nlohmann::json::object();
        for (const auto& k : outOrder) {
            auto it = originalOutputs.find(k);
            origObj[k] = (it != originalOutputs.end()) ? it->second : 0;
        }
        nlohmann::json optObj = nlohmann::json::object();
        for (const auto& k : outOrder) {
            auto it = optimizedOutputs.find(k);
            optObj[k] = (it != optimizedOutputs.end()) ? it->second : 0;
        }
        return {
            {"inputs", inObj},
            {"originalOutputs", origObj},
            {"optimizedOutputs", optObj},
            {"mismatchedOutput", mismatchedOutput}
        };
    }
};

struct EquivalenceResult {
    bool equivalent{true};
    bool verified{true};
    std::string message;
    CounterExample counterExample;

    nlohmann::json toJson(const std::vector<std::string>& inOrder, const std::vector<std::string>& outOrder) const {
        nlohmann::json res = {
            {"equivalent", equivalent},
            {"verified", verified},
            {"message", message}
        };
        if (!equivalent && verified) {
            res["counterExample"] = counterExample.toJson(inOrder, outOrder);
        }
        return res;
    }
};

class EquivalenceChecker {
public:
    explicit EquivalenceChecker(int maxExhaustiveInputs = 10);

    EquivalenceResult verify(
        const std::vector<IRInstruction>& originalIr,
        const std::vector<IRInstruction>& optimizedIr,
        const SymbolTable& symbolTable);

private:
    int maxExhaustiveInputs_;
};

} // namespace logicopt

#endif
