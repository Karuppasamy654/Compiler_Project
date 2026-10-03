#include "truth_table.h"
#include <cmath>

namespace logicopt {

TruthTableEvaluator::TruthTableEvaluator(int maxExhaustiveInputs)
    : maxExhaustiveInputs_(maxExhaustiveInputs) {}

std::unordered_map<std::string, int> TruthTableEvaluator::evaluateSingle(
    const std::vector<IRInstruction>& ir,
    const std::unordered_map<std::string, int>& inputValuation) {

    std::unordered_map<std::string, int> env = inputValuation;
    env["0"] = 0;
    env["1"] = 1;

    auto getValue = [&](const std::string& arg) -> int {
        if (arg == "0") return 0;
        if (arg == "1") return 1;
        auto it = env.find(arg);
        if (it != env.end()) return it->second;
        return 0;
    };

    for (const auto& inst : ir) {
        if (inst.op == "ASSIGN") {
            env[inst.result] = getValue(inst.arg1);
        } else if (inst.op == "NOT") {
            env[inst.result] = (!getValue(inst.arg1)) ? 1 : 0;
        } else if (inst.op == "AND") {
            env[inst.result] = (getValue(inst.arg1) && getValue(inst.arg2)) ? 1 : 0;
        } else if (inst.op == "OR") {
            env[inst.result] = (getValue(inst.arg1) || getValue(inst.arg2)) ? 1 : 0;
        } else if (inst.op == "XOR") {
            env[inst.result] = (getValue(inst.arg1) ^ getValue(inst.arg2)) ? 1 : 0;
        } else if (inst.op == "NAND") {
            env[inst.result] = !(getValue(inst.arg1) && getValue(inst.arg2)) ? 1 : 0;
        } else if (inst.op == "NOR") {
            env[inst.result] = !(getValue(inst.arg1) || getValue(inst.arg2)) ? 1 : 0;
        } else if (inst.op == "XNOR") {
            env[inst.result] = !(getValue(inst.arg1) ^ getValue(inst.arg2)) ? 1 : 0;
        }
    }

    return env;
}

TruthTable TruthTableEvaluator::evaluate(const std::vector<IRInstruction>& ir, const SymbolTable& symbolTable) {
    TruthTable table;

    for (const auto& pair : symbolTable.getSymbols()) {
        if (pair.second.kind == SymbolKind::INPUT) {
            table.inputSignals.push_back(pair.first);
        } else if (pair.second.kind == SymbolKind::OUTPUT) {
            table.outputSignals.push_back(pair.first);
        }
    }

    size_t numInputs = table.inputSignals.size();
    if (numInputs > static_cast<size_t>(maxExhaustiveInputs_)) {
        table.skipped = true;
        table.skipReason = "Truth table skipped: Input count (" + std::to_string(numInputs) +
                           ") exceeds exhaustive evaluation limit (" + std::to_string(maxExhaustiveInputs_) + ").";
        return table;
    }

    size_t numRows = 1ULL << numInputs;
    for (size_t r = 0; r < numRows; ++r) {
        std::unordered_map<std::string, int> inputValuation;
        for (size_t i = 0; i < numInputs; ++i) {
            int bit = (r >> (numInputs - 1 - i)) & 1;
            inputValuation[table.inputSignals[i]] = bit;
        }

        std::unordered_map<std::string, int> fullEnv = evaluateSingle(ir, inputValuation);

        std::unordered_map<std::string, int> outputValuation;
        for (const auto& outName : table.outputSignals) {
            auto it = fullEnv.find(outName);
            outputValuation[outName] = (it != fullEnv.end()) ? it->second : 0;
        }

        table.rows.push_back({inputValuation, outputValuation});
    }

    return table;
}

} // namespace logicopt
