#ifndef LOGICOPT_AST_H
#define LOGICOPT_AST_H

#include <string>
#include <vector>
#include <memory>
#include <nlohmann/json.hpp>

namespace logicopt {

enum class ASTNodeType {
    PROGRAM,
    INPUT_DECL,
    OUTPUT_DECL,
    WIRE_DECL,
    ASSIGNMENT,
    IDENTIFIER,
    CONSTANT,
    UNARY_OP,
    BINARY_OP
};

std::string astNodeTypeToString(ASTNodeType type);

class ASTNode {
public:
    ASTNodeType type;
    int line;
    int column;

    ASTNode(ASTNodeType type, int line, int column)
        : type(type), line(line), column(column) {}

    virtual ~ASTNode() = default;
    virtual nlohmann::json toJson() const = 0;
};

struct SignalRef {
    std::string name;
    int line;
    int column;
};

class ProgramNode : public ASTNode {
public:
    std::vector<std::unique_ptr<ASTNode>> declarations;
    std::vector<std::unique_ptr<ASTNode>> statements;

    ProgramNode(int line, int column)
        : ASTNode(ASTNodeType::PROGRAM, line, column) {}

    nlohmann::json toJson() const override;
};

class InputDeclNode : public ASTNode {
public:
    std::vector<SignalRef> signals;

    InputDeclNode(std::vector<SignalRef> signals, int line, int column)
        : ASTNode(ASTNodeType::INPUT_DECL, line, column), signals(std::move(signals)) {}

    nlohmann::json toJson() const override;
};

class OutputDeclNode : public ASTNode {
public:
    std::vector<SignalRef> signals;

    OutputDeclNode(std::vector<SignalRef> signals, int line, int column)
        : ASTNode(ASTNodeType::OUTPUT_DECL, line, column), signals(std::move(signals)) {}

    nlohmann::json toJson() const override;
};

class WireDeclNode : public ASTNode {
public:
    std::vector<SignalRef> signals;

    WireDeclNode(std::vector<SignalRef> signals, int line, int column)
        : ASTNode(ASTNodeType::WIRE_DECL, line, column), signals(std::move(signals)) {}

    nlohmann::json toJson() const override;
};

class AssignmentNode : public ASTNode {
public:
    std::string target;
    std::unique_ptr<ASTNode> expression;

    AssignmentNode(std::string target, std::unique_ptr<ASTNode> expression, int line, int column)
        : ASTNode(ASTNodeType::ASSIGNMENT, line, column), target(std::move(target)), expression(std::move(expression)) {}

    nlohmann::json toJson() const override;
};

class IdentifierNode : public ASTNode {
public:
    std::string name;

    IdentifierNode(std::string name, int line, int column)
        : ASTNode(ASTNodeType::IDENTIFIER, line, column), name(std::move(name)) {}

    nlohmann::json toJson() const override;
};

class ConstantNode : public ASTNode {
public:
    int value; // 0 or 1

    ConstantNode(int value, int line, int column)
        : ASTNode(ASTNodeType::CONSTANT, line, column), value(value) {}

    nlohmann::json toJson() const override;
};

enum class UnaryOpType {
    NOT
};

std::string unaryOpToString(UnaryOpType op);

class UnaryOpNode : public ASTNode {
public:
    UnaryOpType op;
    std::unique_ptr<ASTNode> operand;

    UnaryOpNode(UnaryOpType op, std::unique_ptr<ASTNode> operand, int line, int column)
        : ASTNode(ASTNodeType::UNARY_OP, line, column), op(op), operand(std::move(operand)) {}

    nlohmann::json toJson() const override;
};

enum class BinaryOpType {
    AND,
    OR,
    XOR,
    NAND,
    NOR,
    XNOR
};

std::string binaryOpToString(BinaryOpType op);

class BinaryOpNode : public ASTNode {
public:
    BinaryOpType op;
    std::unique_ptr<ASTNode> left;
    std::unique_ptr<ASTNode> right;

    BinaryOpNode(BinaryOpType op, std::unique_ptr<ASTNode> left, std::unique_ptr<ASTNode> right, int line, int column)
        : ASTNode(ASTNodeType::BINARY_OP, line, column), op(op), left(std::move(left)), right(std::move(right)) {}

    nlohmann::json toJson() const override;
};

} // namespace logicopt

#endif
