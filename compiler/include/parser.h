#ifndef LOGICOPT_PARSER_H
#define LOGICOPT_PARSER_H

#include <vector>
#include <string>
#include <memory>
#include "token.h"
#include "ast.h"

namespace logicopt {

struct ParserError {
    std::string message;
    int line;
    int column;

    nlohmann::json toJson() const {
        return {
            {"type", "SyntaxError"},
            {"message", message},
            {"line", line},
            {"column", column}
        };
    }
};

class Parser {
public:
    explicit Parser(std::vector<Token> tokens);

    std::unique_ptr<ProgramNode> parse();
    const std::vector<ParserError>& getErrors() const { return errors_; }
    bool hasErrors() const { return !errors_.empty(); }

private:
    std::vector<Token> tokens_;
    size_t current_;
    std::vector<ParserError> errors_;

    const Token& peek() const;
    const Token& previous() const;
    bool isAtEnd() const;
    bool check(TokenType type) const;
    bool match(TokenType type);
    Token advance();
    Token consume(TokenType type, const std::string& message);
    void synchronize();
    void error(const Token& token, const std::string& message);

    std::unique_ptr<ASTNode> declaration();
    std::unique_ptr<ASTNode> inputDeclaration();
    std::unique_ptr<ASTNode> outputDeclaration();
    std::unique_ptr<ASTNode> wireDeclaration();
    std::vector<SignalRef> identifierList();

    std::unique_ptr<ASTNode> statement();
    std::unique_ptr<ASTNode> assignmentStatement();

    std::unique_ptr<ASTNode> expression();
    std::unique_ptr<ASTNode> orExpression();
    std::unique_ptr<ASTNode> xorExpression();
    std::unique_ptr<ASTNode> andExpression();
    std::unique_ptr<ASTNode> unaryExpression();
    std::unique_ptr<ASTNode> primaryExpression();
};

} // namespace logicopt

#endif
