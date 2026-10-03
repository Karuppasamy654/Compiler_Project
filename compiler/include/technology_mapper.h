#ifndef LOGICOPT_TECH_MAPPER_H
#define LOGICOPT_TECH_MAPPER_H

#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include "ir.h"
#include "symbol_table.h"
#include "circuit.h"

namespace logicopt {

enum class TechTarget {
    STANDARD,
    NAND_ONLY,
    NOR_ONLY
};

std::string techTargetToString(TechTarget target);

class TechnologyMapper {
public:
    TechnologyMapper() = default;

    // Transforms an IR instruction stream into a target gate netlist IR (e.g. NAND-only or NOR-only)
    std::vector<IRInstruction> mapToTechnology(
        const std::vector<IRInstruction>& inputIr,
        const SymbolTable& symbolTable,
        TechTarget target
    );
};

} // namespace logicopt

#endif
