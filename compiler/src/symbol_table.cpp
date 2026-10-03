#include "symbol_table.h"

namespace logicopt {

std::string symbolKindToString(SymbolKind kind) {
    switch (kind) {
        case SymbolKind::INPUT:  return "INPUT";
        case SymbolKind::OUTPUT: return "OUTPUT";
        case SymbolKind::WIRE:   return "WIRE";
        default:                 return "UNKNOWN";
    }
}

bool SymbolTable::declare(const std::string& name, SymbolKind kind, int line, int column) {
    if (symbols_.find(name) != symbols_.end()) {
        return false; // Duplicate
    }
    symbols_[name] = Symbol{name, kind, line, column, false, false};
    declarationOrder_.push_back(name);
    return true;
}

Symbol* SymbolTable::lookup(const std::string& name) {
    auto it = symbols_.find(name);
    if (it != symbols_.end()) {
        return &(it->second);
    }
    return nullptr;
}

const Symbol* SymbolTable::lookup(const std::string& name) const {
    auto it = symbols_.find(name);
    if (it != symbols_.end()) {
        return &(it->second);
    }
    return nullptr;
}

bool SymbolTable::exists(const std::string& name) const {
    return symbols_.find(name) != symbols_.end();
}

std::vector<Symbol> SymbolTable::getAllSymbols() const {
    std::vector<Symbol> list;
    for (const auto& name : declarationOrder_) {
        auto it = symbols_.find(name);
        if (it != symbols_.end()) {
            list.push_back(it->second);
        }
    }
    return list;
}

nlohmann::json SymbolTable::toJson() const {
    nlohmann::json arr = nlohmann::json::array();
    for (const auto& sym : getAllSymbols()) {
        arr.push_back(sym.toJson());
    }
    return arr;
}

} // namespace logicopt
