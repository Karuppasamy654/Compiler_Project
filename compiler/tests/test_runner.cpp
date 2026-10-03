#include <iostream>
#include <cassert>
#include <string>
#include <vector>
#include "compiler.h"
#include "lexer.h"
#include "parser.h"
#include "semantic.h"

void test1_SimpleAND() {
    std::cout << "[TEST 1] Simple AND..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("input a, b;\noutput y;\n\ny = a AND b;\n");
    assert(res["success"].get<bool>());
    assert(res["truthTable"]["rows"].size() == 4);
    assert(res["verification"]["equivalent"].get<bool>());
}

void test2_SimpleOR() {
    std::cout << "[TEST 2] Simple OR..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("input a, b;\noutput y;\n\ny = a OR b;\n");
    assert(res["success"].get<bool>());
    assert(res["truthTable"]["rows"].size() == 4);
}

void test3_NOT() {
    std::cout << "[TEST 3] NOT..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("input a;\noutput y;\n\ny = NOT a;\n");
    assert(res["success"].get<bool>());
    assert(res["truthTable"]["rows"].size() == 2);
}

void test4_XOR() {
    std::cout << "[TEST 4] XOR..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("input a, b;\noutput y;\n\ny = a XOR b;\n");
    assert(res["success"].get<bool>());
}

void test5_NAND() {
    std::cout << "[TEST 5] NAND..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("input a, b;\noutput y;\n\ny = a NAND b;\n");
    assert(res["success"].get<bool>());
}

void test6_NOR() {
    std::cout << "[TEST 6] NOR..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("input a, b;\noutput y;\n\ny = a NOR b;\n");
    assert(res["success"].get<bool>());
}

void test7_XNOR() {
    std::cout << "[TEST 7] XNOR..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("input a, b;\noutput y;\n\ny = a XNOR b;\n");
    assert(res["success"].get<bool>());
}

void test8_ParenthesesAndPrecedence() {
    std::cout << "[TEST 8] Parentheses & Operator Precedence..." << std::endl;
    logicopt::Compiler compiler;
    auto res1 = compiler.compile("input a, b, c;\noutput y;\n\ny = a OR b AND c;\n");
    auto res2 = compiler.compile("input a, b, c;\noutput y;\n\ny = a OR (b AND c);\n");
    assert(res1["success"].get<bool>());
    assert(res2["success"].get<bool>());
    assert(res1["truthTable"]["rows"] == res2["truthTable"]["rows"]);
}

void test9_ExplicitWiresAndFullAdder() {
    std::cout << "[TEST 9] Full Adder Regression Test with Explicit Wires..." << std::endl;
    logicopt::Compiler compiler;
    std::string fullAdderCode =
        "input a, b, cin;\n"
        "output sum, cout;\n"
        "wire axorb;\n"
        "axorb = a XOR b;\n"
        "sum = axorb XOR cin;\n"
        "cout = (a AND b) OR (axorb AND cin);\n";

    auto res = compiler.compile(fullAdderCode);
    assert(res["success"].get<bool>());

    auto rows = res["truthTable"]["rows"];
    assert(rows.size() == 8);

    // Verify all 8 truth table combinations exhaustively
    // 000 -> sum=0, cout=0
    // 001 -> sum=1, cout=0
    // 010 -> sum=1, cout=0
    // 011 -> sum=0, cout=1
    // 100 -> sum=1, cout=0
    // 101 -> sum=0, cout=1
    // 110 -> sum=0, cout=1
    // 111 -> sum=1, cout=1
    int expectedOutputs[8][2] = {
        {0, 0}, {1, 0}, {1, 0}, {0, 1},
        {1, 0}, {0, 1}, {0, 1}, {1, 1}
    };

    for (size_t i = 0; i < 8; ++i) {
        int sumVal = rows[i]["outputs"]["sum"].get<int>();
        int coutVal = rows[i]["outputs"]["cout"].get<int>();
        assert(sumVal == expectedOutputs[i][0]);
        assert(coutVal == expectedOutputs[i][1]);
    }
    assert(res["verification"]["equivalent"].get<bool>());
}

void test10_LexerErrorHandling() {
    std::cout << "[TEST 10] Lexer Error Handling..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("input a, b;\noutput y;\n\ny = a AND 5;");
    assert(!res["success"].get<bool>());
    assert(res["errors"].size() > 0);
    assert(res["errors"][0]["line"].get<int>() == 4);
}

void test11_SemanticUndefinedVariable() {
    std::cout << "[TEST 11] Semantic Audit: Undefined Variable..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("input a;\noutput y;\n\ny = a AND b;\n");
    assert(!res["success"].get<bool>());
    assert(res["errors"][0]["type"].get<std::string>() == "SemanticError");
}

void test12_SemanticDuplicateInput() {
    std::cout << "[TEST 12] Semantic Audit: Duplicate Input..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("input a, a;\noutput y;\n\ny = a;\n");
    assert(!res["success"].get<bool>());
}

void test13_SemanticUnassignedOutput() {
    std::cout << "[TEST 13] Semantic Audit: Unassigned Output..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("input a, b;\noutput x, y;\n\ny = a AND b;\n");
    assert(!res["success"].get<bool>());
}

void test14_SemanticDuplicateAssignment() {
    std::cout << "[TEST 14] Semantic Audit: Duplicate Assignment..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("input a, b, c;\noutput y;\n\ny = a AND b;\ny = c OR b;\n");
    assert(!res["success"].get<bool>());
}

void test15_SemanticUnassignedWire() {
    std::cout << "[TEST 15] Semantic Audit: Unassigned Wire..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("input a;\noutput y;\nwire w;\n\ny = a AND w;\n");
    assert(!res["success"].get<bool>());
}

void test16_SemanticCombinationalCycle() {
    std::cout << "[TEST 16] Semantic Audit: Combinational Cycle..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("input c, d;\noutput a, b;\n\na = b AND c;\nb = a OR d;\n");
    assert(!res["success"].get<bool>());
    assert(res["errors"][0]["type"].get<std::string>() == "CircularDependencyError");
}

void test17_BooleanOptimizationLaws() {
    std::cout << "[TEST 17] Optimizer Audit: Boolean Algebraic Laws..." << std::endl;
    logicopt::Compiler compiler;

    // A AND 1 -> A
    auto res1 = compiler.compile("input a;\noutput y;\n\ny = a AND 1;\n");
    assert(res1["success"].get<bool>());
    assert(res1["verification"]["equivalent"].get<bool>());

    // A OR 0 -> A
    auto res2 = compiler.compile("input a;\noutput y;\n\ny = a OR 0;\n");
    assert(res2["success"].get<bool>());
    assert(res2["verification"]["equivalent"].get<bool>());

    // A AND 0 -> 0
    auto res3 = compiler.compile("input a;\noutput y;\n\ny = a AND 0;\n");
    assert(res3["success"].get<bool>());

    // A XOR A -> 0
    auto res4 = compiler.compile("input a;\noutput y;\n\ny = a XOR a;\n");
    assert(res4["success"].get<bool>());

    // NOT NOT A -> A
    auto res5 = compiler.compile("input a;\noutput y;\n\ny = NOT (NOT a);\n");
    assert(res5["success"].get<bool>());
    assert(res5["verification"]["equivalent"].get<bool>());
}

void test18_CommonSubexpressionElimination() {
    std::cout << "[TEST 18] Optimizer Audit: Common Subexpression Elimination (CSE)..." << std::endl;
    logicopt::Compiler compiler;
    std::string cseCode =
        "input a, b, c;\n"
        "output x, y;\n"
        "x = (a AND b) OR c;\n"
        "y = (a AND b) XOR c;\n";

    auto res = compiler.compile(cseCode);
    assert(res["success"].get<bool>());
    assert(res["optimizations"].size() > 0);
    assert(res["verification"]["equivalent"].get<bool>());
}

void test19_DeadLogicElimination() {
    std::cout << "[TEST 19] Optimizer Audit: Dead Logic Elimination..." << std::endl;
    logicopt::Compiler compiler;
    std::string deadLogicCode =
        "input a, b, c;\n"
        "output y;\n"
        "wire unused;\n"
        "unused = a XOR b;\n"
        "y = c;\n";

    auto res = compiler.compile(deadLogicCode);
    assert(res["success"].get<bool>());
    assert(res["optimizedCircuit"]["gates"].size() < res["originalCircuit"]["gates"].size());
    assert(res["verification"]["equivalent"].get<bool>());
}

void test20_TruthTableLimitAndSkipping() {
    std::cout << "[TEST 20] Truth Table Input Limit Check..." << std::endl;
    logicopt::Compiler compiler;
    // 11 inputs > default max limit of 10
    std::string bigCode = "input i0, i1, i2, i3, i4, i5, i6, i7, i8, i9, i10;\noutput y;\ny = i0 AND i1;\n";
    auto res = compiler.compile(bigCode);
    assert(res["success"].get<bool>());
    assert(res["truthTable"]["skipped"].get<bool>());
    assert(!res["verification"]["equivalent"].get<bool>());
    assert(!res["verification"]["verified"].get<bool>());
}

void test21_EquivalenceAndCounterexample() {
    std::cout << "[TEST 21] Equivalence Verification..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("input a, b, c;\noutput y;\ny = (a AND b) OR NOT c;\n");
    assert(res["success"].get<bool>());
    assert(res["verification"]["equivalent"].get<bool>());
}

void test22_TechnologyMappingNANDOnly() {
    std::cout << "[TEST 22] Technology Mapping: NAND-Only Synthesis..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("input a, b;\noutput y;\ny = a OR b;\n");
    assert(res["success"].get<bool>());
    assert(res.contains("nandCircuit"));

    // Verify physically ONLY NAND, INPUT, OUTPUT, or CONSTANT gates
    for (const auto& g : res["nandCircuit"]["gates"]) {
        std::string t = g["type"].get<std::string>();
        assert(t == "NAND" || t == "INPUT" || t == "OUTPUT" || t == "CONSTANT" || t == "WIRE");
    }
}

void test23_TechnologyMappingNOROnly() {
    std::cout << "[TEST 23] Technology Mapping: NOR-Only Synthesis..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("input a, b;\noutput y;\ny = a AND b;\n");
    assert(res["success"].get<bool>());
    assert(res.contains("norCircuit"));

    // Verify physically ONLY NOR, INPUT, OUTPUT, or CONSTANT gates
    for (const auto& g : res["norCircuit"]["gates"]) {
        std::string t = g["type"].get<std::string>();
        assert(t == "NOR" || t == "INPUT" || t == "OUTPUT" || t == "CONSTANT" || t == "WIRE");
    }
}

void test24_KMapSolver234Vars() {
    std::cout << "[TEST 24] K-Map Solver for 2, 3, and 4 Variables..." << std::endl;
    logicopt::Compiler compiler;

    // 2 vars
    auto res2 = compiler.compile("input a, b;\noutput y;\ny = a AND b;\n");
    assert(res2["kmap"]["y"]["supported"].get<bool>());
    assert(res2["kmap"]["y"]["numVariables"].get<int>() == 2);

    // 3 vars
    auto res3 = compiler.compile("input a, b, c;\noutput y;\ny = (a AND b) OR c;\n");
    assert(res3["kmap"]["y"]["supported"].get<bool>());
    assert(res3["kmap"]["y"]["numVariables"].get<int>() == 3);

    // 4 vars
    auto res4 = compiler.compile("input a, b, c, d;\noutput y;\ny = (a AND b) OR (c AND d);\n");
    assert(res4["kmap"]["y"]["supported"].get<bool>());
    assert(res4["kmap"]["y"]["numVariables"].get<int>() == 4);
}

void test25_MetricsAndCriticalPath() {
    std::cout << "[TEST 25] Metrics & Critical Path Analysis..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("input a, b, c;\noutput y;\ny = (a AND b) OR c;\n");
    assert(res["success"].get<bool>());
    assert(res.contains("metrics"));
    assert(res.contains("criticalPath"));
    assert(res["metrics"]["original"]["totalGates"].get<int>() >= 2);
    assert(res["criticalPath"]["estimatedDelayNs"].get<double>() > 0.0);
}

void test26_OriginalVsOptimizedCircuitAudit() {
    std::cout << "[TEST 26] Original vs Optimized Circuit Comparison Audit..." << std::endl;
    logicopt::Compiler compiler;

    // 1. Full Adder (Minimal optimal logic gate structure -> 5 gates original, 5 gates optimized, 0 gate reduction, equivalent)
    std::string fullAdderCode =
        "input a, b, cin;\n"
        "output sum, cout;\n"
        "wire axorb;\n"
        "axorb = a XOR b;\n"
        "sum = axorb XOR cin;\n"
        "cout = (a AND b) OR (axorb AND cin);\n";

    auto resFA = compiler.compile(fullAdderCode);
    assert(resFA["success"].get<bool>());
    assert(resFA.contains("originalCircuit"));
    // Verify logic gate count
    assert(resFA["metrics"]["original"]["totalGates"].get<int>() == resFA["metrics"]["optimized"]["totalGates"].get<int>());
    assert(resFA["metrics"]["gateReduction"].get<int>() == 0);
    assert(resFA["verification"]["equivalent"].get<bool>() == true);

    // 2. Optimization-Heavy Circuit (Performs real transformations & gate reduction)
    std::string optHeavyCode =
        "input a, b;\n"
        "output y;\n"
        "wire x1, x2, unused;\n"
        "x1 = a AND 1;\n"
        "x2 = a AND b;\n"
        "unused = a XOR b;\n"
        "y = x2 OR 0;\n";

    auto resOpt = compiler.compile(optHeavyCode);
    assert(resOpt["success"].get<bool>());
    assert(resOpt["originalCircuit"]["gates"].size() > resOpt["optimizedCircuit"]["gates"].size());
    assert(resOpt["metrics"]["gateReduction"].get<int>() > 0);
    assert(resOpt["verification"]["equivalent"].get<bool>() == true);
}

int main() {
    std::cout << "========================================\n";
    std::cout << "  LOGICOPT C++ COMPLETE RE-TEST SUITE   \n";
    std::cout << "========================================\n";

    try {
        test1_SimpleAND();
        test2_SimpleOR();
        test3_NOT();
        test4_XOR();
        test5_NAND();
        test6_NOR();
        test7_XNOR();
        test8_ParenthesesAndPrecedence();
        test9_ExplicitWiresAndFullAdder();
        test10_LexerErrorHandling();
        test11_SemanticUndefinedVariable();
        test12_SemanticDuplicateInput();
        test13_SemanticUnassignedOutput();
        test14_SemanticDuplicateAssignment();
        test15_SemanticUnassignedWire();
        test16_SemanticCombinationalCycle();
        test17_BooleanOptimizationLaws();
        test18_CommonSubexpressionElimination();
        test19_DeadLogicElimination();
        test20_TruthTableLimitAndSkipping();
        test21_EquivalenceAndCounterexample();
        test22_TechnologyMappingNANDOnly();
        test23_TechnologyMappingNOROnly();
        test24_KMapSolver234Vars();
        test25_MetricsAndCriticalPath();
        test26_OriginalVsOptimizedCircuitAudit();

        std::cout << "\nALL 26 COMPREHENSIVE RE-TEST SUITES PASSED SUCCESSFULLY! ✓\n";
        return 0;
    } catch (const std::exception& ex) {
        std::cerr << "\nTest failed with exception: " << ex.what() << std::endl;
        return 1;
    }
}
