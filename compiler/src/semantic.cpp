#include "semantic.h"
#include <algorithm>

namespace logicopt {

SemanticAnalyzer::SemanticAnalyzer() = default;

bool SemanticAnalyzer::analyze(const ProgramNode& program) {
    errors_.clear();
    warnings_.clear();
    dependencyGraph_.clear();
    targetAssignmentLines_.clear();

    processDeclarations(program);
    processStatements(program);
    checkCircularDependencies();
    checkMissingAndUnused();

    return errors_.empty();
}

void SemanticAnalyzer::processDeclarations(const ProgramNode& program) {
    for (const auto& declNode : program.declarations) {
        if (declNode->type == ASTNodeType::INPUT_DECL) {
            auto* inputDecl = static_cast<const InputDeclNode*>(declNode.get());
            for (const auto& sig : inputDecl->signals) {
                if (!symbolTable_.declare(sig.name, SymbolKind::INPUT, sig.line, sig.column)) {
                    errors_.push_back({
                        "SemanticError",
                        "Symbol '" + sig.name + "' has already been declared.",
                        sig.line,
                        sig.column
                    });
                }
            }
        } else if (declNode->type == ASTNodeType::OUTPUT_DECL) {
            auto* outputDecl = static_cast<const OutputDeclNode*>(declNode.get());
            for (const auto& sig : outputDecl->signals) {
                if (!symbolTable_.declare(sig.name, SymbolKind::OUTPUT, sig.line, sig.column)) {
                    errors_.push_back({
                        "SemanticError",
                        "Symbol '" + sig.name + "' has already been declared.",
                        sig.line,
                        sig.column
                    });
                }
            }
        } else if (declNode->type == ASTNodeType::WIRE_DECL) {
            auto* wireDecl = static_cast<const WireDeclNode*>(declNode.get());
            for (const auto& sig : wireDecl->signals) {
                if (!symbolTable_.declare(sig.name, SymbolKind::WIRE, sig.line, sig.column)) {
                    errors_.push_back({
                        "SemanticError",
                        "Symbol '" + sig.name + "' has already been declared.",
                        sig.line,
                        sig.column
                    });
                }
            }
        }
    }
}

void SemanticAnalyzer::processStatements(const ProgramNode& program) {
    for (const auto& stmtNode : program.statements) {
        if (stmtNode->type == ASTNodeType::ASSIGNMENT) {
            auto* assign = static_cast<const AssignmentNode*>(stmtNode.get());

            Symbol* targetSym = symbolTable_.lookup(assign->target);
            if (!targetSym) {
                // Automatically declare target as an implicit WIRE signal if not declared beforehand!
                symbolTable_.declare(assign->target, SymbolKind::WIRE, assign->line, assign->column);
                targetSym = symbolTable_.lookup(assign->target);
            }

            if (targetSym) {
                if (targetSym->kind == SymbolKind::INPUT) {
                    errors_.push_back({
                        "SemanticError",
                        "Cannot assign to input signal '" + assign->target + "'. Input signals are read-only.",
                        assign->line,
                        assign->column
                    });
                }
                if (targetSym->assigned) {
                    errors_.push_back({
                        "SemanticError",
                        "Signal '" + assign->target + "' is assigned multiple times.",
                        assign->line,
                        assign->column
                    });
                }
                targetSym->assigned = true;
            }

            targetAssignmentLines_[assign->target] = assign->line;

            std::vector<std::string> rhsSignals;
            if (assign->expression) {
                checkExpression(assign->expression.get(), assign->target, rhsSignals);
            }

            for (const auto& rhsSig : rhsSignals) {
                dependencyGraph_[assign->target].push_back({rhsSig, assign->line});
            }
        }
    }
}

void SemanticAnalyzer::checkExpression(const ASTNode* exprNode, const std::string& target, std::vector<std::string>& rhsSignals) {
    if (!exprNode) return;

    switch (exprNode->type) {
        case ASTNodeType::IDENTIFIER: {
            auto* idNode = static_cast<const IdentifierNode*>(exprNode);
            Symbol* sym = symbolTable_.lookup(idNode->name);
            if (!sym) {
                errors_.push_back({
                    "SemanticError",
                    "Signal '" + idNode->name + "' is not declared as an INPUT and is not defined by any expression.",
                    idNode->line,
                    idNode->column
                });
            } else {
                sym->used = true;
                rhsSignals.push_back(idNode->name);
            }
            break;
        }
        case ASTNodeType::CONSTANT: {
            break;
        }
        case ASTNodeType::UNARY_OP: {
            auto* unOp = static_cast<const UnaryOpNode*>(exprNode);
            checkExpression(unOp->operand.get(), target, rhsSignals);
            break;
        }
        case ASTNodeType::BINARY_OP: {
            auto* binOp = static_cast<const BinaryOpNode*>(exprNode);
            checkExpression(binOp->left.get(), target, rhsSignals);
            checkExpression(binOp->right.get(), target, rhsSignals);
            break;
        }
        default:
            break;
    }
}

void SemanticAnalyzer::checkCircularDependencies() {
    std::unordered_set<std::string> visited;
    std::unordered_set<std::string> recStack;
    std::vector<std::string> path;

    for (const auto& pair : dependencyGraph_) {
        const std::string& node = pair.first;
        if (visited.find(node) == visited.end()) {
            dfsCycle(node, visited, recStack, path);
        }
    }
}

bool SemanticAnalyzer::dfsCycle(const std::string& current,
                                std::unordered_set<std::string>& visited,
                                std::unordered_set<std::string>& recStack,
                                std::vector<std::string>& path) {
    visited.insert(current);
    recStack.insert(current);
    path.push_back(current);

    auto it = dependencyGraph_.find(current);
    if (it != dependencyGraph_.end()) {
        for (const auto& neighborPair : it->second) {
            const std::string& neighbor = neighborPair.first;
            if (recStack.find(neighbor) != recStack.end()) {
                // Cycle detected!
                std::string cycleStr;
                auto cycleStart = std::find(path.begin(), path.end(), neighbor);
                for (auto pit = cycleStart; pit != path.end(); ++pit) {
                    cycleStr += *pit + " -> ";
                }
                cycleStr += neighbor;

                int errLine = targetAssignmentLines_.count(current) ? targetAssignmentLines_[current] : 1;
                errors_.push_back({
                    "CircularDependencyError",
                    "Circular dependency detected in circuit: " + cycleStr,
                    errLine,
                    1
                });
                return true;
            }

            if (visited.find(neighbor) == visited.end()) {
                if (dfsCycle(neighbor, visited, recStack, path)) {
                    return true;
                }
            }
        }
    }

    recStack.erase(current);
    path.pop_back();
    return false;
}

void SemanticAnalyzer::checkMissingAndUnused() {
    for (const auto& pair : symbolTable_.getSymbols()) {
        const Symbol& sym = pair.second;
        if (sym.kind == SymbolKind::OUTPUT && !sym.assigned) {
            errors_.push_back({
                "SemanticError",
                "Output signal '" + sym.name + "' is declared but never assigned.",
                sym.line,
                sym.column
            });
        }
        if (sym.kind == SymbolKind::WIRE && !sym.assigned && sym.used) {
            errors_.push_back({
                "SemanticError",
                "Wire signal '" + sym.name + "' is used in an expression but never assigned a value.",
                sym.line,
                sym.column
            });
        }
        if (sym.kind == SymbolKind::WIRE && !sym.used && sym.assigned) {
            // Implicit or explicit unused wires generate warnings
            warnings_.push_back({
                "Wire '" + sym.name + "' is declared/created but never used in any downstream output expression.",
                sym.line,
                sym.column
            });
        }
        if (sym.kind == SymbolKind::INPUT && !sym.used) {
            warnings_.push_back({
                "Input '" + sym.name + "' is declared but never used in any logic expression.",
                sym.line,
                sym.column
            });
        }
    }
}

} // namespace logicopt
