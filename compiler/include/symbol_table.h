#ifndef LOGICOPT_SYMBOL_TABLE_H
#define LOGICOPT_SYMBOL_TABLE_H

#include <string>
#include <unordered_map>
#include <vector>
#include <nlohmann/json.hpp>

namespace logicopt {

enum class SymbolKind {
    INPUT,
    OUTPUT,
    WIRE
};

std::string symbolKindToString(SymbolKind kind);

struct Symbol {
    std::string name;
    SymbolKind kind;
    int line;
    int column;
    bool assigned{false};
    bool used{false};

    nlohmann::json toJson() const {
        return {
            {"name", name},
            {"kind", symbolKindToString(kind)},
            {"line", line},
            {"column", column},
            {"assigned", assigned},
            {"used", used}
        };
    }
};

class SymbolTable {
public:
    SymbolTable() = default;

    bool declare(const std::string& name, SymbolKind kind, int line, int column);
    Symbol* lookup(const std::string& name);
    const Symbol* lookup(const std::string& name) const;
    bool exists(const std::string& name) const;

    const std::unordered_map<std::string, Symbol>& getSymbols() const { return symbols_; }
    std::vector<Symbol> getAllSymbols() const;

    nlohmann::json toJson() const;

private:
    std::unordered_map<std::string, Symbol> symbols_;
    std::vector<std::string> declarationOrder_;
};

} // namespace logicopt

#endif
