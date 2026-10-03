#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include "compiler.h"

int main(int argc, char* argv[]) {
    std::string sourceCode;

    if (argc > 1) {
        std::string filename = argv[1];
        if (filename == "-h" || filename == "--help") {
            std::cout << "Usage: logicopt_compiler [filename]\n";
            std::cout << "Compiles LogicOpt Boolean DSL source code and outputs JSON result to stdout.\n";
            std::cout << "If no filename is provided, source code is read from stdin.\n";
            return 0;
        }

        std::ifstream file(filename);
        if (!file.is_open()) {
            nlohmann::json errJson = {
                {"success", false},
                {"errors", nlohmann::json::array({{
                    {"type", "FileError"},
                    {"message", "Could not open source file '" + filename + "'."},
                    {"line", 1},
                    {"column", 1}
                }})},
                {"warnings", nlohmann::json::array()}
            };
            std::cout << errJson.dump(2) << std::endl;
            return 1;
        }
        std::stringstream ss;
        ss << file.rdbuf();
        sourceCode = ss.str();
    } else {
        std::stringstream ss;
        ss << std::cin.rdbuf();
        sourceCode = ss.str();
    }

    logicopt::Compiler compiler;
    nlohmann::json result = compiler.compile(sourceCode);
    std::cout << result.dump(2) << std::endl;

    return 0;
}
