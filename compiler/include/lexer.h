#ifndef LOGICOPT_LEXER_H
#define LOGICOPT_LEXER_H

#include <string>
#include <vector>
#include "token.h"

namespace logicopt {

struct LexerError {
    std::string message;
    int line;
    int column;

    nlohmann::json toJson() const {
        return {
            {"type", "LexicalError"},
            {"message", message},
            {"line", line},
            {"column", column}
        };
    }
};

class Lexer {
public:
    explicit Lexer(std::string source);

    std::vector<Token> tokenize();
    const std::vector<LexerError>& getErrors() const { return errors_; }
    bool hasErrors() const { return !errors_.empty(); }

private:
    std::string source_;
    size_t position_;
    int line_;
    int column_;
    std::vector<LexerError> errors_;

    char peek() const;
    char peekNext() const;
    char advance();
    bool isAtEnd() const;
    void skipWhitespaceAndComments();
    Token scanToken();
    Token identifierOrKeyword();
    Token numberConstant();
};

} // namespace logicopt

#endif
