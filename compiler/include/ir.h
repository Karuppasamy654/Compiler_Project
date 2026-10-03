#ifndef LOGICOPT_IR_H
#define LOGICOPT_IR_H

#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include "ast.h"

namespace logicopt {

struct IRInstruction {
    std::string op;     // ASSIGN, NOT, AND, OR, XOR, NAND, NOR, XNOR
    std::string arg1;   // Operand 1 (signal name or constant "0"/"1")
    std::string arg2;   // Operand 2 (optional)
    std::string result; // Target signal or temporary name
    int line;
    int column;

    nlohmann::json toJson() const {
        return {
            {"op", op},
            {"arg1", arg1},
            {"arg2", arg2},
            {"result", result},
            {"line", line},
            {"column", column}
        };
    }

    std::string toString() const {
        if (op == "ASSIGN") {
            return result + " = " + arg1;
        } else if (op == "NOT") {
            return result + " = NOT " + arg1;
        } else {
            return result + " = " + arg1 + " " + op + " " + arg2;
        }
    }
};

class IRGenerator {
public:
    IRGenerator() = default;

    std::vector<IRInstruction> generate(const ProgramNode& program);

private:
    int tempCount_{1};
    std::vector<IRInstruction> instructions_;

    std::string newTemp();
    std::string emitExpr(const ASTNode* exprNode);
};

} // namespace logicopt

#endif
