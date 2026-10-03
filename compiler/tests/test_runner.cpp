#include <iostream>
#include <cassert>
#include <string>
#include "compiler.h"
#include "lexer.h"
#include "parser.h"
#include "semantic.h"

void test1_SimpleAND() {
    std::cout << "[TEST 1] Simple AND..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A, B\nOUTPUT Y\n\nY = A AND B");
    assert(res["success"].get<bool>());
    assert(res["truthTable"]["rows"].size() == 4);
    assert(res["verification"]["equivalent"].get<bool>());
}

void test2_SimpleOR() {
    std::cout << "[TEST 2] Simple OR..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A, B\nOUTPUT Y\n\nY = A OR B");
    assert(res["success"].get<bool>());
    assert(res["truthTable"]["rows"].size() == 4);
}

void test3_NOT() {
    std::cout << "[TEST 3] NOT..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A\nOUTPUT Y\n\nY = NOT A");
    assert(res["success"].get<bool>());
    assert(res["truthTable"]["rows"].size() == 2);
}

void test4_XOR() {
    std::cout << "[TEST 4] XOR..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A, B\nOUTPUT Y\n\nY = A XOR B");
    assert(res["success"].get<bool>());
}

void test5_NAND() {
    std::cout << "[TEST 5] NAND..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A, B\nOUTPUT Y\n\nY = A NAND B");
    assert(res["success"].get<bool>());
}

void test6_NOR() {
    std::cout << "[TEST 6] NOR..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A, B\nOUTPUT Y\n\nY = A NOR B");
    assert(res["success"].get<bool>());
}

void test7_XNOR() {
    std::cout << "[TEST 7] XNOR..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A, B\nOUTPUT Y\n\nY = A XNOR B");
    assert(res["success"].get<bool>());
}

void test8_Parentheses() {
    std::cout << "[TEST 8] Parentheses..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A, B, C\nOUTPUT Y\n\nY = (A AND B) OR (NOT C)");
    assert(res["success"].get<bool>());
    assert(res["truthTable"]["rows"].size() == 8);
}

void test9_OperatorPrecedence() {
    std::cout << "[TEST 9] Operator Precedence..." << std::endl;
    // Y = A OR B AND C must match A OR (B AND C)
    logicopt::Compiler compiler;
    auto res1 = compiler.compile("INPUT A, B, C\nOUTPUT Y\n\nY = A OR B AND C");
    auto res2 = compiler.compile("INPUT A, B, C\nOUTPUT Y\n\nY = A OR (B AND C)");
    assert(res1["success"].get<bool>());
    assert(res2["success"].get<bool>());
    assert(res1["truthTable"]["rows"] == res2["truthTable"]["rows"]);
}

void test10_NestedExpressions() {
    std::cout << "[TEST 10] Nested Expressions..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A, B, C, D\nOUTPUT Y\n\nY = ((A AND B) OR C) XOR NOT D");
    assert(res["success"].get<bool>());
    assert(res["truthTable"]["rows"].size() == 16);
}

void test11_UnknownSignal() {
    std::cout << "[TEST 11] Unknown Signal Error..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A, B\nOUTPUT Y\n\nY = A AND UNKNOWN");
    assert(!res["success"].get<bool>());
    assert(res["errors"].size() > 0);
}

void test12_MissingOutput() {
    std::cout << "[TEST 12] Missing Output Assignment..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A\nOUTPUT Y");
    assert(!res["success"].get<bool>());
}

void test13_MissingExpression() {
    std::cout << "[TEST 13] Missing Expression Syntax Error..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A, B\nOUTPUT Y\n\nY = A AND");
    assert(!res["success"].get<bool>());
}

void test14_Constants() {
    std::cout << "[TEST 14] Constants 0/1..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A\nOUTPUT Y\n\nY = A AND 1");
    assert(res["success"].get<bool>());
}

void test15_Optimization() {
    std::cout << "[TEST 15] Optimization (A AND 1 -> A)..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A\nOUTPUT Y\n\nY = A AND 1");
    assert(res["success"].get<bool>());
    assert(res["optimizations"].size() > 0);
    assert(res["verification"]["equivalent"].get<bool>());
}

void test16_MultipleOutputs() {
    std::cout << "[TEST 16] Multiple Outputs..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A, B\nOUTPUT SUM, CARRY\n\nSUM = A XOR B\nCARRY = A AND B");
    assert(res["success"].get<bool>());
}

void test17_FullAdder() {
    std::cout << "[TEST 17] Full Adder..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile(
        "INPUT A, B, CIN\n"
        "OUTPUT SUM, CARRY\n\n"
        "SUM = A XOR B XOR CIN\n"
        "CARRY = (A AND B) OR (B AND CIN) OR (A AND CIN)"
    );
    assert(res["success"].get<bool>());
    assert(res["truthTable"]["rows"].size() == 8);
    assert(res["verification"]["equivalent"].get<bool>());
}

void test18_InvalidSyntax() {
    std::cout << "[TEST 18] Invalid Syntax Error..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A B C OUTPUT");
    assert(!res["success"].get<bool>());
}

void test19_CircuitGeneration() {
    std::cout << "[TEST 19] Circuit Generation..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A, B\nOUTPUT Y\n\nY = A AND B");
    assert(res["success"].get<bool>());
    assert(res["originalCircuit"]["gates"].size() > 0);
}

void test20_TruthTableGeneration() {
    std::cout << "[TEST 20] Truth Table Generation..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A, B\nOUTPUT Y\n\nY = A AND B");
    assert(res["success"].get<bool>());
    assert(!res["truthTable"]["skipped"].get<bool>());
}

void test21_EquivalenceVerification() {
    std::cout << "[TEST 21] Equivalence Verification..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A, B, C\nOUTPUT Y\n\nY = (A AND B) OR NOT C");
    assert(res["success"].get<bool>());
    assert(res["verification"]["equivalent"].get<bool>());
}

void test22_KMapSolver() {
    std::cout << "[TEST 22] K-Map Solver..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A, B, C\nOUTPUT Y\n\nY = (A AND B) OR NOT C");
    assert(res["success"].get<bool>());
    assert(res.contains("kmap"));
    assert(res["kmap"]["Y"]["supported"].get<bool>());
    assert(res["kmap"]["Y"]["numVariables"].get<int>() == 3);
}

void test23_TechnologyMapping() {
    std::cout << "[TEST 23] Technology Mapping (NAND/NOR)..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A, B\nOUTPUT Y\n\nY = A OR B");
    assert(res["success"].get<bool>());
    assert(res.contains("nandCircuit"));
    assert(res.contains("norCircuit"));
    assert(res["nandCircuit"]["gates"].size() > 0);
    assert(res["norCircuit"]["gates"].size() > 0);
}

void test24_CriticalPathAnalysis() {
    std::cout << "[TEST 24] Critical Path Analysis..." << std::endl;
    logicopt::Compiler compiler;
    auto res = compiler.compile("INPUT A, B, C\nOUTPUT Y\n\nY = (A AND B) OR C");
    assert(res["success"].get<bool>());
    assert(res.contains("criticalPath"));
    assert(res["criticalPath"]["estimatedDelayNs"].get<double>() > 0.0);
    assert(res["criticalPath"]["criticalPathGates"].size() > 0);
}

int main() {
    std::cout << "========================================\n";
    std::cout << "  LOGICOPT C++ 24-SUITE COMPILER TESTS  \n";
    std::cout << "========================================\n";

    try {
        test1_SimpleAND();
        test2_SimpleOR();
        test3_NOT();
        test4_XOR();
        test5_NAND();
        test6_NOR();
        test7_XNOR();
        test8_Parentheses();
        test9_OperatorPrecedence();
        test10_NestedExpressions();
        test11_UnknownSignal();
        test12_MissingOutput();
        test13_MissingExpression();
        test14_Constants();
        test15_Optimization();
        test16_MultipleOutputs();
        test17_FullAdder();
        test18_InvalidSyntax();
        test19_CircuitGeneration();
        test20_TruthTableGeneration();
        test21_EquivalenceVerification();
        test22_KMapSolver();
        test23_TechnologyMapping();
        test24_CriticalPathAnalysis();

        std::cout << "\nALL 24 C++ COMPILER TEST SUITES PASSED SUCCESSFULLY! ✓\n";
        return 0;
    } catch (const std::exception& ex) {
        std::cerr << "\nTest failed with exception: " << ex.what() << std::endl;
        return 1;
    }
}
