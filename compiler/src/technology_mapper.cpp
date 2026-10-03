#include "technology_mapper.h"
#include <unordered_set>

namespace logicopt {

std::string techTargetToString(TechTarget target) {
    switch (target) {
        case TechTarget::NAND_ONLY: return "NAND_ONLY";
        case TechTarget::NOR_ONLY: return "NOR_ONLY";
        default: return "STANDARD";
    }
}

std::vector<IRInstruction> TechnologyMapper::mapToTechnology(
    const std::vector<IRInstruction>& inputIr,
    const SymbolTable& symbolTable,
    TechTarget target) {

    if (target == TechTarget::STANDARD) {
        return inputIr;
    }

    std::vector<IRInstruction> result;
    int tempCounter = 1;

    auto genTemp = [&]() {
        return "_t_tech_" + std::to_string(tempCounter++);
    };

    for (const auto& inst : inputIr) {
        if (target == TechTarget::NAND_ONLY) {
            // Transform logic operators into NAND equivalence:
            // NOT A       -> A NAND A
            // A AND B     -> (A NAND B) NAND (A NAND B)
            // A OR B      -> (A NAND A) NAND (B NAND B)
            // A XOR B     -> T1 = A NAND B; T2 = A NAND T1; T3 = B NAND T1; RES = T2 NAND T3
            if (inst.op == "ASSIGN") {
                result.push_back(inst);
            } else if (inst.op == "NOT") {
                result.push_back({"NAND", inst.arg1, inst.arg1, inst.result, inst.line, inst.column});
            } else if (inst.op == "NAND") {
                result.push_back(inst);
            } else if (inst.op == "AND") {
                std::string t1 = genTemp();
                result.push_back({"NAND", inst.arg1, inst.arg2, t1, inst.line, inst.column});
                result.push_back({"NAND", t1, t1, inst.result, inst.line, inst.column});
            } else if (inst.op == "OR") {
                std::string t1 = genTemp();
                std::string t2 = genTemp();
                result.push_back({"NAND", inst.arg1, inst.arg1, t1, inst.line, inst.column});
                result.push_back({"NAND", inst.arg2, inst.arg2, t2, inst.line, inst.column});
                result.push_back({"NAND", t1, t2, inst.result, inst.line, inst.column});
            } else if (inst.op == "NOR") {
                // (A OR B) THEN NOT
                std::string t1 = genTemp();
                std::string t2 = genTemp();
                std::string t3 = genTemp();
                result.push_back({"NAND", inst.arg1, inst.arg1, t1, inst.line, inst.column});
                result.push_back({"NAND", inst.arg2, inst.arg2, t2, inst.line, inst.column});
                result.push_back({"NAND", t1, t2, t3, inst.line, inst.column});
                result.push_back({"NAND", t3, t3, inst.result, inst.line, inst.column});
            } else if (inst.op == "XOR") {
                std::string t1 = genTemp();
                std::string t2 = genTemp();
                std::string t3 = genTemp();
                result.push_back({"NAND", inst.arg1, inst.arg2, t1, inst.line, inst.column});
                result.push_back({"NAND", inst.arg1, t1, t2, inst.line, inst.column});
                result.push_back({"NAND", inst.arg2, t1, t3, inst.line, inst.column});
                result.push_back({"NAND", t2, t3, inst.result, inst.line, inst.column});
            } else if (inst.op == "XNOR") {
                std::string t1 = genTemp();
                std::string t2 = genTemp();
                std::string t3 = genTemp();
                std::string t4 = genTemp();
                result.push_back({"NAND", inst.arg1, inst.arg2, t1, inst.line, inst.column});
                result.push_back({"NAND", inst.arg1, t1, t2, inst.line, inst.column});
                result.push_back({"NAND", inst.arg2, t1, t3, inst.line, inst.column});
                result.push_back({"NAND", t2, t3, t4, inst.line, inst.column});
                result.push_back({"NAND", t4, t4, inst.result, inst.line, inst.column});
            }
        } else if (target == TechTarget::NOR_ONLY) {
            // Transform logic operators into NOR equivalence:
            // NOT A       -> A NOR A
            // A OR B      -> (A NOR B) NOR (A NOR B)
            // A AND B     -> (A NOR A) NOR (B NOR B)
            if (inst.op == "ASSIGN") {
                result.push_back(inst);
            } else if (inst.op == "NOT") {
                result.push_back({"NOR", inst.arg1, inst.arg1, inst.result, inst.line, inst.column});
            } else if (inst.op == "NOR") {
                result.push_back(inst);
            } else if (inst.op == "OR") {
                std::string t1 = genTemp();
                result.push_back({"NOR", inst.arg1, inst.arg2, t1, inst.line, inst.column});
                result.push_back({"NOR", t1, t1, inst.result, inst.line, inst.column});
            } else if (inst.op == "AND") {
                std::string t1 = genTemp();
                std::string t2 = genTemp();
                result.push_back({"NOR", inst.arg1, inst.arg1, t1, inst.line, inst.column});
                result.push_back({"NOR", inst.arg2, inst.arg2, t2, inst.line, inst.column});
                result.push_back({"NOR", t1, t2, inst.result, inst.line, inst.column});
            } else if (inst.op == "NAND") {
                std::string t1 = genTemp();
                std::string t2 = genTemp();
                std::string t3 = genTemp();
                result.push_back({"NOR", inst.arg1, inst.arg1, t1, inst.line, inst.column});
                result.push_back({"NOR", inst.arg2, inst.arg2, t2, inst.line, inst.column});
                result.push_back({"NOR", t1, t2, t3, inst.line, inst.column});
                result.push_back({"NOR", t3, t3, inst.result, inst.line, inst.column});
            } else if (inst.op == "XOR") {
                std::string t1 = genTemp();
                std::string t2 = genTemp();
                std::string t3 = genTemp();
                std::string t4 = genTemp();
                result.push_back({"NOR", inst.arg1, inst.arg1, t1, inst.line, inst.column});
                result.push_back({"NOR", inst.arg2, inst.arg2, t2, inst.line, inst.column});
                result.push_back({"NOR", t1, t2, t3, inst.line, inst.column});
                result.push_back({"NOR", inst.arg1, inst.arg2, t4, inst.line, inst.column});
                result.push_back({"NOR", t3, t4, inst.result, inst.line, inst.column});
            } else if (inst.op == "XNOR") {
                std::string t1 = genTemp();
                std::string t2 = genTemp();
                std::string t3 = genTemp();
                result.push_back({"NOR", inst.arg1, inst.arg2, t1, inst.line, inst.column});
                result.push_back({"NOR", inst.arg1, t1, t2, inst.line, inst.column});
                result.push_back({"NOR", inst.arg2, t1, t3, inst.line, inst.column});
                result.push_back({"NOR", t2, t3, inst.result, inst.line, inst.column});
            }
        }
    }

    return result;
}

} // namespace logicopt
