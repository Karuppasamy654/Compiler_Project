#include "verifier.h"

namespace logicopt {

EquivalenceChecker::EquivalenceChecker(int maxExhaustiveInputs)
    : maxExhaustiveInputs_(maxExhaustiveInputs) {}

EquivalenceResult EquivalenceChecker::verify(
    const std::vector<IRInstruction>& originalIr,
    const std::vector<IRInstruction>& optimizedIr,
    const SymbolTable& symbolTable) {

    EquivalenceResult res;
    std::vector<std::string> inputs;
    std::vector<std::string> outputs;

    for (const auto& pair : symbolTable.getSymbols()) {
        if (pair.second.kind == SymbolKind::INPUT) {
            inputs.push_back(pair.first);
        } else if (pair.second.kind == SymbolKind::OUTPUT) {
            outputs.push_back(pair.first);
        }
    }

    size_t numInputs = inputs.size();
    if (numInputs > static_cast<size_t>(maxExhaustiveInputs_)) {
        res.equivalent = false;
        res.verified = false;
        res.message = "Equivalence not exhaustively verified because input space (" +
                      std::to_string(numInputs) + " inputs) exceeds configured limit (" +
                      std::to_string(maxExhaustiveInputs_) + ").";
        return res;
    }

    size_t numRows = 1ULL << numInputs;
    for (size_t r = 0; r < numRows; ++r) {
        std::unordered_map<std::string, int> inputValuation;
        for (size_t i = 0; i < numInputs; ++i) {
            int bit = (r >> (numInputs - 1 - i)) & 1;
            inputValuation[inputs[i]] = bit;
        }

        std::unordered_map<std::string, int> origEnv = TruthTableEvaluator::evaluateSingle(originalIr, inputValuation);
        std::unordered_map<std::string, int> optEnv = TruthTableEvaluator::evaluateSingle(optimizedIr, inputValuation);

        for (const auto& outName : outputs) {
            int origVal = origEnv.count(outName) ? origEnv[outName] : 0;
            int optVal = optEnv.count(outName) ? optEnv[outName] : 0;

            if (origVal != optVal) {
                res.equivalent = false;
                res.verified = true;
                res.message = "Mismatch found for output '" + outName + "'.";
                res.counterExample.inputValuation = inputValuation;

                for (const auto& o : outputs) {
                    res.counterExample.originalOutputs[o] = origEnv.count(o) ? origEnv[o] : 0;
                    res.counterExample.optimizedOutputs[o] = optEnv.count(o) ? optEnv[o] : 0;
                }
                res.counterExample.mismatchedOutput = outName;
                return res;
            }
        }
    }

    res.equivalent = true;
    res.verified = true;
    res.message = "Circuits are functionally equivalent for all " + std::to_string(numRows) + " input combinations.";
    return res;
}

} // namespace logicopt
