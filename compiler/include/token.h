#ifndef LOGICOPT_TOKEN_H
#define LOGICOPT_TOKEN_H

#include <string>
#include <nlohmann/json.hpp>

namespace logicopt {

enum class TokenType {
    INPUT,
    OUTPUT,
    WIRE,
    AND,
    OR,
    NOT,
    XOR,
    NAND,
    NOR,
    XNOR,
    IDENTIFIER,
    CONSTANT_0,
    CONSTANT_1,
    ASSIGN,
    COMMA,
    SEMICOLON,
    LPAREN,
    RPAREN,
    END_OF_FILE,
    INVALID
};

std::string tokenTypeToString(TokenType type);

struct Token {
    TokenType type;
    std::string lexeme;
    int line;
    int column;

    nlohmann::json toJson() const {
        return {
            {"type", tokenTypeToString(type)},
            {"lexeme", lexeme},
            {"line", line},
            {"column", column}
        };
    }
};

} // namespace logicopt

#endif
