#include "lexer.h"
#include <cctype>
#include <unordered_map>
#include <algorithm>

namespace logicopt {

Lexer::Lexer(std::string source)
    : source_(std::move(source)), position_(0), line_(1), column_(1) {}

char Lexer::peek() const {
    if (isAtEnd()) return '\0';
    return source_[position_];
}

char Lexer::peekNext() const {
    if (position_ + 1 >= source_.size()) return '\0';
    return source_[position_ + 1];
}

char Lexer::advance() {
    if (isAtEnd()) return '\0';
    char c = source_[position_++];
    if (c == '\n') {
        line_++;
        column_ = 1;
    } else {
        column_++;
    }
    return c;
}

bool Lexer::isAtEnd() const {
    return position_ >= source_.size();
}

void Lexer::skipWhitespaceAndComments() {
    while (!isAtEnd()) {
        char c = peek();
        if (c == ' ' || c == '\t' || c == '\r' || c == '\n') {
            advance();
        } else if (c == '/' && peekNext() == '/') {
            // Single line comment
            while (!isAtEnd() && peek() != '\n') {
                advance();
            }
        } else if (c == '/' && peekNext() == '*') {
            // Multi-line comment
            advance(); // '/'
            advance(); // '*'
            while (!isAtEnd()) {
                if (peek() == '*' && peekNext() == '/') {
                    advance(); // '*'
                    advance(); // '/'
                    break;
                }
                advance();
            }
        } else {
            break;
        }
    }
}

std::vector<Token> Lexer::tokenize() {
    std::vector<Token> tokens;
    while (!isAtEnd()) {
        skipWhitespaceAndComments();
        if (isAtEnd()) break;

        int startLine = line_;
        int startCol = column_;
        char c = peek();

        if (std::isalpha(static_cast<unsigned char>(c)) || c == '_') {
            tokens.push_back(identifierOrKeyword());
        } else if (c == '0' || c == '1') {
            tokens.push_back(numberConstant());
        } else if (std::isdigit(static_cast<unsigned char>(c))) {
            // Numbers other than 0 and 1 are invalid in Boolean logic!
            std::string invalidNum;
            while (!isAtEnd() && std::isalnum(static_cast<unsigned char>(peek()))) {
                invalidNum += advance();
            }
            errors_.push_back({
                "Invalid constant '" + invalidNum + "'. Boolean constants must be 0 or 1.",
                startLine,
                startCol
            });
            tokens.push_back({TokenType::INVALID, invalidNum, startLine, startCol});
        } else {
            advance();
            TokenType type = TokenType::INVALID;
            std::string lexeme(1, c);
            switch (c) {
                case '=': type = TokenType::ASSIGN; break;
                case ',': type = TokenType::COMMA; break;
                case ';': type = TokenType::SEMICOLON; break;
                case '(': type = TokenType::LPAREN; break;
                case ')': type = TokenType::RPAREN; break;
                default:
                    errors_.push_back({
                        "Unexpected character '" + lexeme + "' in source.",
                        startLine,
                        startCol
                    });
                    break;
            }
            tokens.push_back({type, lexeme, startLine, startCol});
        }
    }
    tokens.push_back({TokenType::END_OF_FILE, "", line_, column_});
    return tokens;
}

Token Lexer::identifierOrKeyword() {
    int startLine = line_;
    int startCol = column_;
    std::string lexeme;

    while (!isAtEnd() && (std::isalnum(static_cast<unsigned char>(peek())) || peek() == '_')) {
        lexeme += advance();
    }

    std::string upper = lexeme;
    std::transform(upper.begin(), upper.end(), upper.begin(), [](unsigned char ch) { return std::toupper(ch); });

    static const std::unordered_map<std::string, TokenType> keywords = {
        {"INPUT",  TokenType::INPUT},
        {"OUTPUT", TokenType::OUTPUT},
        {"WIRE",   TokenType::WIRE},
        {"AND",    TokenType::AND},
        {"OR",     TokenType::OR},
        {"NOT",    TokenType::NOT},
        {"XOR",    TokenType::XOR},
        {"NAND",   TokenType::NAND},
        {"NOR",    TokenType::NOR},
        {"XNOR",   TokenType::XNOR}
    };

    auto it = keywords.find(upper);
    if (it != keywords.end()) {
        return {it->second, lexeme, startLine, startCol};
    }

    return {TokenType::IDENTIFIER, lexeme, startLine, startCol};
}

Token Lexer::numberConstant() {
    int startLine = line_;
    int startCol = column_;
    char c = advance();
    std::string lexeme(1, c);

    if (!isAtEnd() && std::isalnum(static_cast<unsigned char>(peek()))) {
        while (!isAtEnd() && std::isalnum(static_cast<unsigned char>(peek()))) {
            lexeme += advance();
        }
        errors_.push_back({
            "Invalid identifier/constant '" + lexeme + "'. Identifiers cannot start with digits.",
            startLine,
            startCol
        });
        return {TokenType::INVALID, lexeme, startLine, startCol};
    }

    TokenType type = (c == '0') ? TokenType::CONSTANT_0 : TokenType::CONSTANT_1;
    return {type, lexeme, startLine, startCol};
}

} // namespace logicopt
