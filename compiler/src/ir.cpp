#include "ir.h"

namespace logicopt {

std::string IRGenerator::newTemp() {
    return "t" + std::to_string(tempCount_++);
}

std::vector<IRInstruction> IRGenerator::generate(const ProgramNode& program) {
    tempCount_ = 1;
    instructions_.clear();

    for (const auto& stmtNode : program.statements) {
        if (stmtNode->type == ASTNodeType::ASSIGNMENT) {
            auto* assign = static_cast<const AssignmentNode*>(stmtNode.get());
            if (assign->expression) {
                std::string exprRes = emitExpr(assign->expression.get());
                instructions_.push_back({
                    "ASSIGN",
                    exprRes,
                    "",
                    assign->target,
                    assign->line,
                    assign->column
                });
            }
        }
    }

    return instructions_;
}

std::string IRGenerator::emitExpr(const ASTNode* exprNode) {
    if (!exprNode) return "0";

    switch (exprNode->type) {
        case ASTNodeType::IDENTIFIER: {
            auto* idNode = static_cast<const IdentifierNode*>(exprNode);
            return idNode->name;
        }
        case ASTNodeType::CONSTANT: {
            auto* constNode = static_cast<const ConstantNode*>(exprNode);
            return std::to_string(constNode->value);
        }
        case ASTNodeType::UNARY_OP: {
            auto* unOp = static_cast<const UnaryOpNode*>(exprNode);
            std::string sub = emitExpr(unOp->operand.get());
            std::string temp = newTemp();
            instructions_.push_back({
                unaryOpToString(unOp->op),
                sub,
                "",
                temp,
                unOp->line,
                unOp->column
            });
            return temp;
        }
        case ASTNodeType::BINARY_OP: {
            auto* binOp = static_cast<const BinaryOpNode*>(exprNode);
            std::string leftRes = emitExpr(binOp->left.get());
            std::string rightRes = emitExpr(binOp->right.get());
            std::string temp = newTemp();
            instructions_.push_back({
                binaryOpToString(binOp->op),
                leftRes,
                rightRes,
                temp,
                binOp->line,
                binOp->column
            });
            return temp;
        }
        default:
            return "0";
    }
}

} // namespace logicopt
