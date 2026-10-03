#include "token.h"

namespace logicopt {

std::string tokenTypeToString(TokenType type) {
    switch (type) {
        case TokenType::INPUT:       return "INPUT";
        case TokenType::OUTPUT:      return "OUTPUT";
        case TokenType::WIRE:        return "WIRE";
        case TokenType::AND:         return "AND";
        case TokenType::OR:          return "OR";
        case TokenType::NOT:         return "NOT";
        case TokenType::XOR:         return "XOR";
        case TokenType::NAND:        return "NAND";
        case TokenType::NOR:         return "NOR";
        case TokenType::XNOR:        return "XNOR";
        case TokenType::IDENTIFIER:  return "IDENTIFIER";
        case TokenType::CONSTANT_0:  return "CONSTANT_0";
        case TokenType::CONSTANT_1:  return "CONSTANT_1";
        case TokenType::ASSIGN:      return "ASSIGN";
        case TokenType::COMMA:       return "COMMA";
        case TokenType::SEMICOLON:   return "SEMICOLON";
        case TokenType::LPAREN:      return "LPAREN";
        case TokenType::RPAREN:      return "RPAREN";
        case TokenType::END_OF_FILE: return "EOF";
        case TokenType::INVALID:     return "INVALID";
        default:                     return "UNKNOWN";
    }
}

} // namespace logicopt
