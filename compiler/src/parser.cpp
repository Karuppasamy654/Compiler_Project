#include "parser.h"

namespace logicopt {

Parser::Parser(std::vector<Token> tokens)
    : tokens_(std::move(tokens)), current_(0) {}

const Token& Parser::peek() const {
    return tokens_[current_];
}

const Token& Parser::previous() const {
    return tokens_[current_ - 1];
}

bool Parser::isAtEnd() const {
    return peek().type == TokenType::END_OF_FILE;
}

bool Parser::check(TokenType type) const {
    if (isAtEnd()) return false;
    return peek().type == type;
}

bool Parser::match(TokenType type) {
    if (check(type)) {
        advance();
        return true;
    }
    return false;
}

Token Parser::advance() {
    if (!isAtEnd()) current_++;
    return previous();
}

Token Parser::consume(TokenType type, const std::string& message) {
    if (check(type)) return advance();
    error(peek(), message);
    return peek();
}

void Parser::error(const Token& token, const std::string& message) {
    errors_.push_back({message, token.line, token.column});
}

void Parser::synchronize() {
    advance();
    while (!isAtEnd()) {
        if (previous().type == TokenType::SEMICOLON) return;
        switch (peek().type) {
            case TokenType::INPUT:
            case TokenType::OUTPUT:
            case TokenType::WIRE:
                return;
            default:
                advance();
        }
    }
}

std::unique_ptr<ProgramNode> Parser::parse() {
    int startLine = tokens_.empty() ? 1 : tokens_[0].line;
    int startCol = tokens_.empty() ? 1 : tokens_[0].column;

    auto program = std::make_unique<ProgramNode>(startLine, startCol);

    while (!isAtEnd()) {
        try {
            // Optional semicolons between statements/declarations
            if (match(TokenType::SEMICOLON)) {
                continue;
            }

            if (check(TokenType::INPUT) || check(TokenType::OUTPUT) || check(TokenType::WIRE)) {
                auto decl = declaration();
                if (decl) program->declarations.push_back(std::move(decl));
            } else if (check(TokenType::IDENTIFIER)) {
                auto stmt = statement();
                if (stmt) program->statements.push_back(std::move(stmt));
            } else {
                error(peek(), "Syntax Error at Line " + std::to_string(peek().line) +
                              ", Column " + std::to_string(peek().column) +
                              ": Unexpected token '" + peek().lexeme + "'. Expected declaration (INPUT/OUTPUT) or assignment.");
                synchronize();
            }
        } catch (...) {
            synchronize();
        }
    }

    return program;
}

std::unique_ptr<ASTNode> Parser::declaration() {
    if (check(TokenType::INPUT)) return inputDeclaration();
    if (check(TokenType::OUTPUT)) return outputDeclaration();
    if (check(TokenType::WIRE)) return wireDeclaration();
    error(peek(), "Expected 'INPUT', 'OUTPUT', or 'WIRE'.");
    return nullptr;
}

std::vector<SignalRef> Parser::identifierList() {
    std::vector<SignalRef> sigs;
    if (!check(TokenType::IDENTIFIER)) return sigs;

    Token first = advance();
    sigs.push_back({first.lexeme, first.line, first.column});

    while (!isAtEnd()) {
        if (match(TokenType::COMMA)) {
            if (check(TokenType::IDENTIFIER)) {
                Token nextTok = advance();
                sigs.push_back({nextTok.lexeme, nextTok.line, nextTok.column});
            } else {
                break;
            }
        } else if (check(TokenType::IDENTIFIER)) {
            // Only consume if on the same line AND NOT followed by '='
            if (peek().line == first.line) {
                if (current_ + 1 < tokens_.size() && tokens_[current_ + 1].type == TokenType::ASSIGN) {
                    break;
                }
                Token nextTok = advance();
                sigs.push_back({nextTok.lexeme, nextTok.line, nextTok.column});
            } else {
                break;
            }
        } else {
            break;
        }
    }

    return sigs;
}

std::unique_ptr<ASTNode> Parser::inputDeclaration() {
    Token kw = advance(); // consume 'INPUT'
    auto sigs = identifierList();
    if (sigs.empty()) {
        error(kw, "INPUT declaration requires at least one signal name (e.g. INPUT A, B).");
    }
    match(TokenType::SEMICOLON); // optional semicolon
    return std::make_unique<InputDeclNode>(std::move(sigs), kw.line, kw.column);
}

std::unique_ptr<ASTNode> Parser::outputDeclaration() {
    Token kw = advance(); // consume 'OUTPUT'
    auto sigs = identifierList();
    if (sigs.empty()) {
        error(kw, "OUTPUT declaration requires at least one signal name (e.g. OUTPUT Y).");
    }
    match(TokenType::SEMICOLON); // optional semicolon
    return std::make_unique<OutputDeclNode>(std::move(sigs), kw.line, kw.column);
}

std::unique_ptr<ASTNode> Parser::wireDeclaration() {
    Token kw = advance(); // consume 'WIRE'
    auto sigs = identifierList();
    match(TokenType::SEMICOLON); // optional semicolon
    return std::make_unique<WireDeclNode>(std::move(sigs), kw.line, kw.column);
}

std::unique_ptr<ASTNode> Parser::statement() {
    return assignmentStatement();
}

std::unique_ptr<ASTNode> Parser::assignmentStatement() {
    Token target = consume(TokenType::IDENTIFIER, "Expected target signal name for assignment.");
    consume(TokenType::ASSIGN, "Expected '=' after target signal name '" + target.lexeme + "'.");
    auto expr = expression();
    match(TokenType::SEMICOLON); // optional semicolon
    return std::make_unique<AssignmentNode>(target.lexeme, std::move(expr), target.line, target.column);
}

std::unique_ptr<ASTNode> Parser::expression() {
    return orExpression();
}

std::unique_ptr<ASTNode> Parser::orExpression() {
    auto expr = xorExpression();
    while (check(TokenType::OR) || check(TokenType::NOR)) {
        Token opToken = advance();
        BinaryOpType op = (opToken.type == TokenType::OR) ? BinaryOpType::OR : BinaryOpType::NOR;
        auto right = xorExpression();
        expr = std::make_unique<BinaryOpNode>(op, std::move(expr), std::move(right), opToken.line, opToken.column);
    }
    return expr;
}

std::unique_ptr<ASTNode> Parser::xorExpression() {
    auto expr = andExpression();
    while (check(TokenType::XOR) || check(TokenType::XNOR)) {
        Token opToken = advance();
        BinaryOpType op = (opToken.type == TokenType::XOR) ? BinaryOpType::XOR : BinaryOpType::XNOR;
        auto right = andExpression();
        expr = std::make_unique<BinaryOpNode>(op, std::move(expr), std::move(right), opToken.line, opToken.column);
    }
    return expr;
}

std::unique_ptr<ASTNode> Parser::andExpression() {
    auto expr = unaryExpression();
    while (check(TokenType::AND) || check(TokenType::NAND)) {
        Token opToken = advance();
        BinaryOpType op = (opToken.type == TokenType::AND) ? BinaryOpType::AND : BinaryOpType::NAND;
        auto right = unaryExpression();
        expr = std::make_unique<BinaryOpNode>(op, std::move(expr), std::move(right), opToken.line, opToken.column);
    }
    return expr;
}

std::unique_ptr<ASTNode> Parser::unaryExpression() {
    if (check(TokenType::NOT)) {
        Token opToken = advance();
        auto operand = unaryExpression();
        return std::make_unique<UnaryOpNode>(UnaryOpType::NOT, std::move(operand), opToken.line, opToken.column);
    }
    return primaryExpression();
}

std::unique_ptr<ASTNode> Parser::primaryExpression() {
    if (check(TokenType::IDENTIFIER)) {
        Token tok = advance();
        return std::make_unique<IdentifierNode>(tok.lexeme, tok.line, tok.column);
    }
    if (check(TokenType::CONSTANT_0)) {
        Token tok = advance();
        return std::make_unique<ConstantNode>(0, tok.line, tok.column);
    }
    if (check(TokenType::CONSTANT_1)) {
        Token tok = advance();
        return std::make_unique<ConstantNode>(1, tok.line, tok.column);
    }
    if (match(TokenType::LPAREN)) {
        Token lparen = previous();
        auto expr = expression();
        consume(TokenType::RPAREN, "Expected ')' to close parentheses opened at line " + std::to_string(lparen.line) + ", column " + std::to_string(lparen.column) + ".");
        return expr;
    }

    std::string prevLexeme = previous().lexeme;
    error(peek(), "Syntax Error at Line " + std::to_string(peek().line) +
                  ", Column " + std::to_string(peek().column) +
                  ": Expected a Boolean expression (signal, 0/1 constant, or '( expression )') after '" + prevLexeme + "', but got '" + peek().lexeme + "'.");
    Token errTok = peek();
    advance();
    return std::make_unique<ConstantNode>(0, errTok.line, errTok.column);
}

} // namespace logicopt
