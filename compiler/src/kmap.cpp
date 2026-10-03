#include "kmap.h"
#include <algorithm>
#include <cmath>

namespace logicopt {

// Helper: Gray code sequence
static std::vector<std::string> getGrayCode(int bits) {
    if (bits == 1) return {"0", "1"};
    if (bits == 2) return {"00", "01", "11", "10"};
    return {};
}

static int grayToInt(const std::string& g) {
    if (g == "0") return 0;
    if (g == "1") return 1;
    if (g == "00") return 0;
    if (g == "01") return 1;
    if (g == "11") return 3;
    if (g == "10") return 2;
    return 0;
}

std::unordered_map<std::string, KMapResult> KMapSolver::solve(const TruthTable& tt) {
    std::unordered_map<std::string, KMapResult> results;

    if (tt.skipped || tt.inputSignals.empty()) {
        for (const auto& outName : tt.outputSignals) {
            KMapResult res;
            res.supported = false;
            results[outName] = res;
        }
        return results;
    }

    int n = static_cast<int>(tt.inputSignals.size());

    for (const auto& outName : tt.outputSignals) {
        KMapResult km;
        km.numVariables = n;
        km.variables = tt.inputSignals;

        if (n < 2 || n > 4) {
            km.supported = false;
            results[outName] = km;
            continue;
        }

        km.supported = true;

        int rowBits = (n == 2) ? 1 : 2;
        int colBits = (n == 2) ? 1 : (n == 3 ? 1 : 2);

        km.rowLabels = getGrayCode(rowBits);
        km.colLabels = getGrayCode(colBits);

        km.grid.resize(km.rowLabels.size(), std::vector<std::string>(km.colLabels.size(), "0"));
        km.mintermGrid.resize(km.rowLabels.size(), std::vector<int>(km.colLabels.size(), 0));

        std::vector<int> onesMinterms;

        for (size_t rIdx = 0; rIdx < tt.rows.size(); ++rIdx) {
            const auto& row = tt.rows[rIdx];
            int mVal = 0;
            for (size_t i = 0; i < tt.inputSignals.size(); ++i) {
                auto it = row.inputValues.find(tt.inputSignals[i]);
                int bit = (it != row.inputValues.end()) ? it->second : 0;
                if (bit) mVal |= (1 << (n - 1 - i));
            }

            auto outIt = row.outputValues.find(outName);
            int outBit = (outIt != row.outputValues.end()) ? outIt->second : 0;

            // Map minterm to K-Map grid coordinates based on Gray code
            int rowVal = 0;
            int colVal = 0;

            if (n == 2) { // Inputs: A (row), B (col)
                rowVal = (mVal >> 1) & 1;
                colVal = mVal & 1;
            } else if (n == 3) { // Inputs: A B (row), C (col)
                rowVal = (mVal >> 1) & 3;
                colVal = mVal & 1;
            } else if (n == 4) { // Inputs: A B (row), C D (col)
                rowVal = (mVal >> 2) & 3;
                colVal = mVal & 3;
            }

            int rPos = 0;
            for (size_t r = 0; r < km.rowLabels.size(); ++r) {
                if (grayToInt(km.rowLabels[r]) == rowVal) { rPos = r; break; }
            }
            int cPos = 0;
            for (size_t c = 0; c < km.colLabels.size(); ++c) {
                if (grayToInt(km.colLabels[c]) == colVal) { cPos = c; break; }
            }

            km.grid[rPos][cPos] = std::to_string(outBit);
            km.mintermGrid[rPos][cPos] = mVal;

            if (outBit == 1) {
                onesMinterms.push_back(mVal);
            }
        }

        // Basic algorithmic grouping for visualization
        if (!onesMinterms.empty()) {
            KMapGroup group;
            group.minterms = onesMinterms;
            group.primeImplicantStr = "Σm(" ;
            for (size_t i = 0; i < onesMinterms.size(); ++i) {
                group.primeImplicantStr += std::to_string(onesMinterms[i]);
                if (i + 1 < onesMinterms.size()) group.primeImplicantStr += ",";
            }
            group.primeImplicantStr += ")";
            km.groups.push_back(group);
            km.minimizedExpression = group.primeImplicantStr;
        } else {
            km.minimizedExpression = "0";
        }

        results[outName] = km;
    }

    return results;
}

} // namespace logicopt
