#ifndef LOGICOPT_OPTIMIZER_H
#define LOGICOPT_OPTIMIZER_H

#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include "ir.h"
#include "symbol_table.h"

namespace logicopt {

struct OptimizationStep {
    int pass;
    std::string rule;
    std::string before;
    std::string after;

    nlohmann::json toJson() const {
        return {
            {"pass", pass},
            {"rule", rule},
            {"before", before},
            {"after", after}
        };
    }
};

class Optimizer {
public:
    Optimizer() = default;

    std::vector<IRInstruction> optimize(const std::vector<IRInstruction>& ir, const SymbolTable& symbolTable);

    const std::vector<OptimizationStep>& getReport() const { return report_; }

private:
    std::vector<OptimizationStep> report_;

    std::vector<IRInstruction> passConstantFoldingAndSimplification(const std::vector<IRInstruction>& instructions, int passNum, bool& changed);
    std::vector<IRInstruction> passConstantPropagation(const std::vector<IRInstruction>& instructions, int passNum, bool& changed);
    std::vector<IRInstruction> passCSE(const std::vector<IRInstruction>& instructions, int passNum, bool& changed);
    std::vector<IRInstruction> passDeadLogicElimination(const std::vector<IRInstruction>& instructions, const SymbolTable& symbolTable, int passNum, bool& changed);

    void recordStep(int pass, const std::string& rule, const std::string& before, const std::string& after);
};

} // namespace logicopt

#endif
