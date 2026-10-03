#include "ast.h"

namespace logicopt {

std::string astNodeTypeToString(ASTNodeType type) {
    switch (type) {
        case ASTNodeType::PROGRAM:     return "Program";
        case ASTNodeType::INPUT_DECL:  return "InputDecl";
        case ASTNodeType::OUTPUT_DECL: return "OutputDecl";
        case ASTNodeType::WIRE_DECL:   return "WireDecl";
        case ASTNodeType::ASSIGNMENT:  return "Assignment";
        case ASTNodeType::IDENTIFIER:  return "Identifier";
        case ASTNodeType::CONSTANT:    return "Constant";
        case ASTNodeType::UNARY_OP:    return "UnaryOp";
        case ASTNodeType::BINARY_OP:   return "BinaryOp";
        default:                       return "Unknown";
    }
}

std::string unaryOpToString(UnaryOpType op) {
    switch (op) {
        case UnaryOpType::NOT: return "NOT";
        default:               return "UNKNOWN";
    }
}

std::string binaryOpToString(BinaryOpType op) {
    switch (op) {
        case BinaryOpType::AND:  return "AND";
        case BinaryOpType::OR:   return "OR";
        case BinaryOpType::XOR:  return "XOR";
        case BinaryOpType::NAND: return "NAND";
        case BinaryOpType::NOR:  return "NOR";
        case BinaryOpType::XNOR: return "XNOR";
        default:                 return "UNKNOWN";
    }
}

nlohmann::json ProgramNode::toJson() const {
    nlohmann::json declsJson = nlohmann::json::array();
    for (const auto& decl : declarations) {
        declsJson.push_back(decl->toJson());
    }
    nlohmann::json stmtsJson = nlohmann::json::array();
    for (const auto& stmt : statements) {
        stmtsJson.push_back(stmt->toJson());
    }
    return {
        {"nodeType", astNodeTypeToString(type)},
        {"line", line},
        {"column", column},
        {"declarations", declsJson},
        {"statements", stmtsJson}
    };
}

nlohmann::json InputDeclNode::toJson() const {
    nlohmann::json sigsJson = nlohmann::json::array();
    for (const auto& sig : signals) {
        sigsJson.push_back({
            {"name", sig.name},
            {"line", sig.line},
            {"column", sig.column}
        });
    }
    return {
        {"nodeType", astNodeTypeToString(type)},
        {"line", line},
        {"column", column},
        {"signals", sigsJson}
    };
}

nlohmann::json OutputDeclNode::toJson() const {
    nlohmann::json sigsJson = nlohmann::json::array();
    for (const auto& sig : signals) {
        sigsJson.push_back({
            {"name", sig.name},
            {"line", sig.line},
            {"column", sig.column}
        });
    }
    return {
        {"nodeType", astNodeTypeToString(type)},
        {"line", line},
        {"column", column},
        {"signals", sigsJson}
    };
}

nlohmann::json WireDeclNode::toJson() const {
    nlohmann::json sigsJson = nlohmann::json::array();
    for (const auto& sig : signals) {
        sigsJson.push_back({
            {"name", sig.name},
            {"line", sig.line},
            {"column", sig.column}
        });
    }
    return {
        {"nodeType", astNodeTypeToString(type)},
        {"line", line},
        {"column", column},
        {"signals", sigsJson}
    };
}

nlohmann::json AssignmentNode::toJson() const {
    return {
        {"nodeType", astNodeTypeToString(type)},
        {"line", line},
        {"column", column},
        {"target", target},
        {"expression", expression ? expression->toJson() : nullptr}
    };
}

nlohmann::json IdentifierNode::toJson() const {
    return {
        {"nodeType", astNodeTypeToString(type)},
        {"line", line},
        {"column", column},
        {"name", name}
    };
}

nlohmann::json ConstantNode::toJson() const {
    return {
        {"nodeType", astNodeTypeToString(type)},
        {"line", line},
        {"column", column},
        {"value", value}
    };
}

nlohmann::json UnaryOpNode::toJson() const {
    return {
        {"nodeType", astNodeTypeToString(type)},
        {"line", line},
        {"column", column},
        {"operator", unaryOpToString(op)},
        {"operand", operand ? operand->toJson() : nullptr}
    };
}

nlohmann::json BinaryOpNode::toJson() const {
    return {
        {"nodeType", astNodeTypeToString(type)},
        {"line", line},
        {"column", column},
        {"operator", binaryOpToString(op)},
        {"left", left ? left->toJson() : nullptr},
        {"right", right ? right->toJson() : nullptr}
    };
}

} // namespace logicopt
