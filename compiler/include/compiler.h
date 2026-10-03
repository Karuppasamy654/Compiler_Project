#ifndef LOGICOPT_COMPILER_H
#define LOGICOPT_COMPILER_H

#include <string>
#include <nlohmann/json.hpp>

namespace logicopt {

class Compiler {
public:
    Compiler() = default;

    nlohmann::json compile(const std::string& sourceCode);
};

} // namespace logicopt

#endif
