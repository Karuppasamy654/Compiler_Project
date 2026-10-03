#ifndef LOGICOPT_SEMANTIC_H
#define LOGICOPT_SEMANTIC_H

#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <memory>
#include <nlohmann/json.hpp>
#include "ast.h"
#include "symbol_table.h"

namespace logicopt {

struct SemanticError {
    std::string type; // "SemanticError"
    std::string message;
    int line;
    int column;

    nlohmann::json toJson() const {
        return {
            {"type", type},
            {"message", message},
            {"line", line},
            {"column", column}
        };
    }
};

struct SemanticWarning {
    std::string message;
    int line;
    int column;

    nlohmann::json toJson() const {
        return {
            {"message", message},
            {"line", line},
            {"column", column}
        };
    }
};

class SemanticAnalyzer {
public:
    SemanticAnalyzer();

    bool analyze(const ProgramNode& program);

    const SymbolTable& getSymbolTable() const { return symbolTable_; }
    SymbolTable& getSymbolTable() { return symbolTable_; }
    const std::vector<SemanticError>& getErrors() const { return errors_; }
    const std::vector<SemanticWarning>& getWarnings() const { return warnings_; }
    bool hasErrors() const { return !errors_.empty(); }

private:
    SymbolTable symbolTable_;
    std::vector<SemanticError> errors_;
    std::vector<SemanticWarning> warnings_;
    std::unordered_map<std::string, std::vector<std::pair<std::string, int>>> dependencyGraph_; // target -> list of (rhs_signal, line)
    std::unordered_map<std::string, int> targetAssignmentLines_;

    void processDeclarations(const ProgramNode& program);
    void processStatements(const ProgramNode& program);
    void checkExpression(const ASTNode* exprNode, const std::string& target, std::vector<std::string>& rhsSignals);
    void checkCircularDependencies();
    void checkMissingAndUnused();

    bool dfsCycle(const std::string& current,
                  std::unordered_set<std::string>& visited,
                  std::unordered_set<std::string>& recStack,
                  std::vector<std::string>& path);
};

} // namespace logicopt

#endif
