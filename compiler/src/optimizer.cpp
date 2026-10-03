#include "optimizer.h"
#include <unordered_map>
#include <unordered_set>
#include <algorithm>

namespace logicopt {

void Optimizer::recordStep(int pass, const std::string& rule, const std::string& before, const std::string& after) {
    if (before != after) {
        report_.push_back({pass, rule, before, after});
    }
}

std::vector<IRInstruction> Optimizer::optimize(const std::vector<IRInstruction>& initialIr, const SymbolTable& symbolTable) {
    report_.clear();
    std::vector<IRInstruction> current = initialIr;

    int maxIterations = 20;
    int passNum = 1;
    bool changed = true;

    while (changed && passNum <= maxIterations) {
        changed = false;

        // 1. Constant folding & Boolean simplification
        current = passConstantFoldingAndSimplification(current, passNum, changed);

        // 2. Constant & Variable propagation
        current = passConstantPropagation(current, passNum, changed);

        // 3. Common Subexpression Elimination (CSE)
        current = passCSE(current, passNum, changed);

        // 4. Dead Logic Elimination
        current = passDeadLogicElimination(current, symbolTable, passNum, changed);

        passNum++;
    }

    return current;
}

// Helper to check if signal is NOT of x
static bool isNotOf(const std::string& signal, const std::string& target, const std::vector<IRInstruction>& instrs) {
    for (const auto& inst : instrs) {
        if (inst.result == signal && inst.op == "NOT" && inst.arg1 == target) {
            return true;
        }
    }
    return false;
}

std::vector<IRInstruction> Optimizer::passConstantFoldingAndSimplification(const std::vector<IRInstruction>& instructions, int passNum, bool& changed) {
    std::vector<IRInstruction> result;

    for (const auto& inst : instructions) {
        IRInstruction newInst = inst;
        std::string beforeStr = inst.toString();

        if (inst.op == "NOT") {
            if (inst.arg1 == "0") {
                newInst.op = "ASSIGN";
                newInst.arg1 = "1";
                recordStep(passNum, "Constant Folding (NOT 0 -> 1)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg1 == "1") {
                newInst.op = "ASSIGN";
                newInst.arg1 = "0";
                recordStep(passNum, "Constant Folding (NOT 1 -> 0)", beforeStr, newInst.toString());
                changed = true;
            } else {
                // Check double negation: NOT(NOT(x)) -> x
                for (const auto& prev : instructions) {
                    if (prev.result == inst.arg1 && prev.op == "NOT") {
                        newInst.op = "ASSIGN";
                        newInst.arg1 = prev.arg1;
                        recordStep(passNum, "Double Negation Law (NOT(NOT(" + prev.arg1 + ")) -> " + prev.arg1 + ")", beforeStr, newInst.toString());
                        changed = true;
                        break;
                    }
                }
            }
        } else if (inst.op == "AND") {
            if (inst.arg1 == "0" || inst.arg2 == "0") {
                newInst.op = "ASSIGN";
                newInst.arg1 = "0";
                newInst.arg2 = "";
                recordStep(passNum, "Annihilation Law (x AND 0 -> 0)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg1 == "1") {
                newInst.op = "ASSIGN";
                newInst.arg1 = inst.arg2;
                newInst.arg2 = "";
                recordStep(passNum, "Identity Law (1 AND x -> x)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg2 == "1") {
                newInst.op = "ASSIGN";
                newInst.arg1 = inst.arg1;
                newInst.arg2 = "";
                recordStep(passNum, "Identity Law (x AND 1 -> x)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg1 == inst.arg2) {
                newInst.op = "ASSIGN";
                newInst.arg1 = inst.arg1;
                newInst.arg2 = "";
                recordStep(passNum, "Idempotent Law (x AND x -> x)", beforeStr, newInst.toString());
                changed = true;
            } else if (isNotOf(inst.arg1, inst.arg2, instructions) || isNotOf(inst.arg2, inst.arg1, instructions)) {
                newInst.op = "ASSIGN";
                newInst.arg1 = "0";
                newInst.arg2 = "";
                recordStep(passNum, "Complement Law (x AND NOT x -> 0)", beforeStr, newInst.toString());
                changed = true;
            }
        } else if (inst.op == "OR") {
            if (inst.arg1 == "1" || inst.arg2 == "1") {
                newInst.op = "ASSIGN";
                newInst.arg1 = "1";
                newInst.arg2 = "";
                recordStep(passNum, "Annihilation Law (x OR 1 -> 1)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg1 == "0") {
                newInst.op = "ASSIGN";
                newInst.arg1 = inst.arg2;
                newInst.arg2 = "";
                recordStep(passNum, "Identity Law (0 OR x -> x)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg2 == "0") {
                newInst.op = "ASSIGN";
                newInst.arg1 = inst.arg1;
                newInst.arg2 = "";
                recordStep(passNum, "Identity Law (x OR 0 -> x)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg1 == inst.arg2) {
                newInst.op = "ASSIGN";
                newInst.arg1 = inst.arg1;
                newInst.arg2 = "";
                recordStep(passNum, "Idempotent Law (x OR x -> x)", beforeStr, newInst.toString());
                changed = true;
            } else if (isNotOf(inst.arg1, inst.arg2, instructions) || isNotOf(inst.arg2, inst.arg1, instructions)) {
                newInst.op = "ASSIGN";
                newInst.arg1 = "1";
                newInst.arg2 = "";
                recordStep(passNum, "Complement Law (x OR NOT x -> 1)", beforeStr, newInst.toString());
                changed = true;
            }
        } else if (inst.op == "XOR") {
            if (inst.arg1 == inst.arg2) {
                newInst.op = "ASSIGN";
                newInst.arg1 = "0";
                newInst.arg2 = "";
                recordStep(passNum, "XOR Self Law (x XOR x -> 0)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg1 == "0") {
                newInst.op = "ASSIGN";
                newInst.arg1 = inst.arg2;
                newInst.arg2 = "";
                recordStep(passNum, "XOR Zero Law (0 XOR x -> x)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg2 == "0") {
                newInst.op = "ASSIGN";
                newInst.arg1 = inst.arg1;
                newInst.arg2 = "";
                recordStep(passNum, "XOR Zero Law (x XOR 0 -> x)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg1 == "1") {
                newInst.op = "NOT";
                newInst.arg1 = inst.arg2;
                newInst.arg2 = "";
                recordStep(passNum, "XOR One Law (1 XOR x -> NOT x)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg2 == "1") {
                newInst.op = "NOT";
                newInst.arg1 = inst.arg1;
                newInst.arg2 = "";
                recordStep(passNum, "XOR One Law (x XOR 1 -> NOT x)", beforeStr, newInst.toString());
                changed = true;
            } else if (isNotOf(inst.arg1, inst.arg2, instructions) || isNotOf(inst.arg2, inst.arg1, instructions)) {
                newInst.op = "ASSIGN";
                newInst.arg1 = "1";
                newInst.arg2 = "";
                recordStep(passNum, "XOR Complement Law (x XOR NOT x -> 1)", beforeStr, newInst.toString());
                changed = true;
            }
        } else if (inst.op == "XNOR") {
            if (inst.arg1 == inst.arg2) {
                newInst.op = "ASSIGN";
                newInst.arg1 = "1";
                newInst.arg2 = "";
                recordStep(passNum, "XNOR Self Law (x XNOR x -> 1)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg1 == "1") {
                newInst.op = "ASSIGN";
                newInst.arg1 = inst.arg2;
                newInst.arg2 = "";
                recordStep(passNum, "XNOR One Law (1 XNOR x -> x)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg2 == "1") {
                newInst.op = "ASSIGN";
                newInst.arg1 = inst.arg1;
                newInst.arg2 = "";
                recordStep(passNum, "XNOR One Law (x XNOR 1 -> x)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg1 == "0") {
                newInst.op = "NOT";
                newInst.arg1 = inst.arg2;
                newInst.arg2 = "";
                recordStep(passNum, "XNOR Zero Law (0 XNOR x -> NOT x)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg2 == "0") {
                newInst.op = "NOT";
                newInst.arg1 = inst.arg1;
                newInst.arg2 = "";
                recordStep(passNum, "XNOR Zero Law (x XNOR 0 -> NOT x)", beforeStr, newInst.toString());
                changed = true;
            } else if (isNotOf(inst.arg1, inst.arg2, instructions) || isNotOf(inst.arg2, inst.arg1, instructions)) {
                newInst.op = "ASSIGN";
                newInst.arg1 = "0";
                newInst.arg2 = "";
                recordStep(passNum, "XNOR Complement Law (x XNOR NOT x -> 0)", beforeStr, newInst.toString());
                changed = true;
            }
        } else if (inst.op == "NAND") {
            if (inst.arg1 == "0" || inst.arg2 == "0") {
                newInst.op = "ASSIGN";
                newInst.arg1 = "1";
                newInst.arg2 = "";
                recordStep(passNum, "NAND Zero Law (x NAND 0 -> 1)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg1 == "1") {
                newInst.op = "NOT";
                newInst.arg1 = inst.arg2;
                newInst.arg2 = "";
                recordStep(passNum, "NAND One Law (1 NAND x -> NOT x)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg2 == "1") {
                newInst.op = "NOT";
                newInst.arg1 = inst.arg1;
                newInst.arg2 = "";
                recordStep(passNum, "NAND One Law (x NAND 1 -> NOT x)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg1 == inst.arg2) {
                newInst.op = "NOT";
                newInst.arg1 = inst.arg1;
                newInst.arg2 = "";
                recordStep(passNum, "NAND Self Law (x NAND x -> NOT x)", beforeStr, newInst.toString());
                changed = true;
            }
        } else if (inst.op == "NOR") {
            if (inst.arg1 == "1" || inst.arg2 == "1") {
                newInst.op = "ASSIGN";
                newInst.arg1 = "0";
                newInst.arg2 = "";
                recordStep(passNum, "NOR One Law (x NOR 1 -> 0)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg1 == "0") {
                newInst.op = "NOT";
                newInst.arg1 = inst.arg2;
                newInst.arg2 = "";
                recordStep(passNum, "NOR Zero Law (0 NOR x -> NOT x)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg2 == "0") {
                newInst.op = "NOT";
                newInst.arg1 = inst.arg1;
                newInst.arg2 = "";
                recordStep(passNum, "NOR Zero Law (x NOR 0 -> NOT x)", beforeStr, newInst.toString());
                changed = true;
            } else if (inst.arg1 == inst.arg2) {
                newInst.op = "NOT";
                newInst.arg1 = inst.arg1;
                newInst.arg2 = "";
                recordStep(passNum, "NOR Self Law (x NOR x -> NOT x)", beforeStr, newInst.toString());
                changed = true;
            }
        }

        result.push_back(newInst);
    }

    return result;
}

std::vector<IRInstruction> Optimizer::passConstantPropagation(const std::vector<IRInstruction>& instructions, int passNum, bool& changed) {
    std::unordered_map<std::string, std::string> copies; // signal -> signal or constant

    for (const auto& inst : instructions) {
        if (inst.op == "ASSIGN") {
            copies[inst.result] = inst.arg1;
        }
    }

    std::vector<IRInstruction> result;
    for (const auto& inst : instructions) {
        IRInstruction newInst = inst;
        std::string beforeStr = inst.toString();

        auto resolve = [&](const std::string& sig) -> std::string {
            std::string curr = sig;
            int limit = 10;
            while (limit-- > 0 && copies.find(curr) != copies.end()) {
                curr = copies[curr];
            }
            return curr;
        };

        if (!newInst.arg1.empty()) {
            std::string resolved1 = resolve(newInst.arg1);
            if (resolved1 != newInst.arg1) {
                newInst.arg1 = resolved1;
                changed = true;
            }
        }
        if (!newInst.arg2.empty()) {
            std::string resolved2 = resolve(newInst.arg2);
            if (resolved2 != newInst.arg2) {
                newInst.arg2 = resolved2;
                changed = true;
            }
        }

        if (changed) {
            recordStep(passNum, "Constant / Variable Propagation", beforeStr, newInst.toString());
        }

        result.push_back(newInst);
    }

    return result;
}

std::vector<IRInstruction> Optimizer::passCSE(const std::vector<IRInstruction>& instructions, int passNum, bool& changed) {
    std::unordered_map<std::string, std::string> exprMap; // "OP:arg1:arg2" -> first_result_signal
    std::unordered_map<std::string, std::string> replacements; // duplicate_result -> first_result

    std::vector<IRInstruction> result;

    for (const auto& inst : instructions) {
        if (inst.op == "ASSIGN") {
            result.push_back(inst);
            continue;
        }

        std::string key1 = inst.op + ":" + inst.arg1 + ":" + inst.arg2;
        std::string key2 = key1;
        if (inst.op == "AND" || inst.op == "OR" || inst.op == "XOR" || inst.op == "NAND" || inst.op == "NOR" || inst.op == "XNOR") {
            key2 = inst.op + ":" + inst.arg2 + ":" + inst.arg1;
        }

        if (exprMap.find(key1) != exprMap.end()) {
            std::string originalRes = exprMap[key1];
            replacements[inst.result] = originalRes;
            IRInstruction subInst = inst;
            subInst.op = "ASSIGN";
            subInst.arg1 = originalRes;
            subInst.arg2 = "";
            recordStep(passNum, "Common Subexpression Elimination", inst.toString(), subInst.toString());
            changed = true;
            result.push_back(subInst);
        } else if (exprMap.find(key2) != exprMap.end()) {
            std::string originalRes = exprMap[key2];
            replacements[inst.result] = originalRes;
            IRInstruction subInst = inst;
            subInst.op = "ASSIGN";
            subInst.arg1 = originalRes;
            subInst.arg2 = "";
            recordStep(passNum, "Common Subexpression Elimination (Commutative)", inst.toString(), subInst.toString());
            changed = true;
            result.push_back(subInst);
        } else {
            exprMap[key1] = inst.result;
            result.push_back(inst);
        }
    }

    return result;
}

std::vector<IRInstruction> Optimizer::passDeadLogicElimination(const std::vector<IRInstruction>& instructions, const SymbolTable& symbolTable, int passNum, bool& changed) {
    std::unordered_set<std::string> needed;

    // Start with all OUTPUT signals
    for (const auto& pair : symbolTable.getSymbols()) {
        if (pair.second.kind == SymbolKind::OUTPUT) {
            needed.insert(pair.first);
        }
    }

    // Traverse backwards to collect all transitively needed signals
    bool added = true;
    while (added) {
        added = false;
        for (auto it = instructions.rbegin(); it != instructions.rend(); ++it) {
            if (needed.find(it->result) != needed.end()) {
                if (!it->arg1.empty() && it->arg1 != "0" && it->arg1 != "1") {
                    if (needed.find(it->arg1) == needed.end()) {
                        needed.insert(it->arg1);
                        added = true;
                    }
                }
                if (!it->arg2.empty() && it->arg2 != "0" && it->arg2 != "1") {
                    if (needed.find(it->arg2) == needed.end()) {
                        needed.insert(it->arg2);
                        added = true;
                    }
                }
            }
        }
    }

    std::vector<IRInstruction> result;
    for (const auto& inst : instructions) {
        if (needed.find(inst.result) != needed.end()) {
            result.push_back(inst);
        } else {
            recordStep(passNum, "Dead Logic Elimination (Removed unused signal " + inst.result + ")", inst.toString(), "[REMOVED]");
            changed = true;
        }
    }

    return result;
}

} // namespace logicopt
