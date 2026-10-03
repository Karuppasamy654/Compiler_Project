#ifndef LOGICOPT_KMAP_H
#define LOGICOPT_KMAP_H

#include <string>
#include <vector>
#include <unordered_map>
#include <nlohmann/json.hpp>
#include "truth_table.h"

namespace logicopt {

struct KMapGroup {
    std::vector<int> minterms;
    std::string primeImplicantStr;

    nlohmann::json toJson() const {
        return {
            {"minterms", minterms},
            {"expression", primeImplicantStr}
        };
    }
};

struct KMapResult {
    bool supported{true};
    int numVariables{0};
    std::vector<std::string> variables;
    std::vector<std::string> rowLabels;
    std::vector<std::string> colLabels;
    std::vector<std::vector<std::string>> grid; // "0", "1", "X"
    std::vector<std::vector<int>> mintermGrid;
    std::vector<KMapGroup> groups;
    std::string minimizedExpression;

    nlohmann::json toJson() const {
        nlohmann::json groupsJson = nlohmann::json::array();
        for (const auto& g : groups) {
            groupsJson.push_back(g.toJson());
        }
        return {
            {"supported", supported},
            {"numVariables", numVariables},
            {"variables", variables},
            {"rowLabels", rowLabels},
            {"colLabels", colLabels},
            {"grid", grid},
            {"mintermGrid", mintermGrid},
            {"groups", groupsJson},
            {"minimizedExpression", minimizedExpression}
        };
    }
};

class KMapSolver {
public:
    KMapSolver() = default;

    // Generate K-Map structure & minimized SOP for 2, 3, or 4 variables per output
    std::unordered_map<std::string, KMapResult> solve(const TruthTable& tt);
};

} // namespace logicopt

#endif
