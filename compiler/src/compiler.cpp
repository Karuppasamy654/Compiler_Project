#include "compiler.h"
#include "lexer.h"
#include "parser.h"
#include "semantic.h"
#include "ir.h"
#include "optimizer.h"
#include "circuit.h"
#include "truth_table.h"
#include "verifier.h"
#include "metrics.h"

namespace logicopt {

nlohmann::json Compiler::compile(const std::string& sourceCode) {
    nlohmann::json errors = nlohmann::json::array();
    nlohmann::json warnings = nlohmann::json::array();

    // 1. Lexical Analysis
    Lexer lexer(sourceCode);
    std::vector<Token> tokens = lexer.tokenize();

    nlohmann::json tokensJson = nlohmann::json::array();
    for (const auto& tok : tokens) {
        tokensJson.push_back(tok.toJson());
    }

    if (lexer.hasErrors()) {
        for (const auto& err : lexer.getErrors()) {
            errors.push_back(err.toJson());
        }
        return {
            {"success", false},
            {"tokens", tokensJson},
            {"errors", errors},
            {"warnings", warnings}
        };
    }

    // 2. Syntax Analysis (Parsing)
    Parser parser(tokens);
    std::unique_ptr<ProgramNode> ast = parser.parse();

    if (parser.hasErrors()) {
        for (const auto& err : parser.getErrors()) {
            errors.push_back(err.toJson());
        }
        return {
            {"success", false},
            {"tokens", tokensJson},
            {"ast", ast ? ast->toJson() : nullptr},
            {"errors", errors},
            {"warnings", warnings}
        };
    }

    // 3. Semantic Analysis & Symbol Table Construction
    SemanticAnalyzer semanticAnalyzer;
    bool semanticSuccess = semanticAnalyzer.analyze(*ast);

    for (const auto& warn : semanticAnalyzer.getWarnings()) {
        warnings.push_back(warn.toJson());
    }

    if (!semanticSuccess) {
        for (const auto& err : semanticAnalyzer.getErrors()) {
            errors.push_back(err.toJson());
        }
        return {
            {"success", false},
            {"tokens", tokensJson},
            {"ast", ast->toJson()},
            {"symbolTable", semanticAnalyzer.getSymbolTable().toJson()},
            {"errors", errors},
            {"warnings", warnings}
        };
    }

    const SymbolTable& symbolTable = semanticAnalyzer.getSymbolTable();

    // 4. IR Generation
    IRGenerator irGen;
    std::vector<IRInstruction> originalIr = irGen.generate(*ast);

    nlohmann::json originalIrJson = nlohmann::json::array();
    for (const auto& inst : originalIr) {
        originalIrJson.push_back(inst.toJson());
    }

    // 5. Optimization Pass
    Optimizer optimizer;
    std::vector<IRInstruction> optimizedIr = optimizer.optimize(originalIr, symbolTable);

    nlohmann::json optimizedIrJson = nlohmann::json::array();
    for (const auto& inst : optimizedIr) {
        optimizedIrJson.push_back(inst.toJson());
    }

    nlohmann::json optimizationsJson = nlohmann::json::array();
    for (const auto& step : optimizer.getReport()) {
        optimizationsJson.push_back(step.toJson());
    }

    // 6. Circuit Synthesis
    CircuitGenerator circuitGen;
    CircuitGraph originalCircuit = circuitGen.generate(originalIr, symbolTable);
    CircuitGraph optimizedCircuit = circuitGen.generate(optimizedIr, symbolTable);

    // 7. Truth Table Evaluation
    TruthTableEvaluator ttEval(10);
    TruthTable truthTable = ttEval.evaluate(originalIr, symbolTable);

    // 8. Equivalence Verification
    EquivalenceChecker verifier(10);
    EquivalenceResult verification = verifier.verify(originalIr, optimizedIr, symbolTable);

    std::vector<std::string> inOrder = truthTable.inputSignals;
    std::vector<std::string> outOrder = truthTable.outputSignals;

    // 9. Metrics Calculation
    MetricsCalculator metricsCalc;
    CompilerMetrics metrics = metricsCalc.calculateComparison(originalCircuit, optimizedCircuit);

    return {
        {"success", true},
        {"tokens", tokensJson},
        {"ast", ast->toJson()},
        {"symbolTable", symbolTable.toJson()},
        {"ir", originalIrJson},
        {"optimizedIr", optimizedIrJson},
        {"originalCircuit", originalCircuit.toJson()},
        {"optimizedCircuit", optimizedCircuit.toJson()},
        {"truthTable", truthTable.toJson()},
        {"verification", verification.toJson(inOrder, outOrder)},
        {"metrics", metrics.toJson()},
        {"optimizations", optimizationsJson},
        {"errors", errors},
        {"warnings", warnings}
    };
}

} // namespace logicopt
