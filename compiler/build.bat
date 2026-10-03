@echo off
echo Building LogicOpt C++ Compiler using g++ (C++17)...

if not exist bin mkdir bin

g++ -std=c++17 -Iinclude -O2 ^
    src/token.cpp ^
    src/lexer.cpp ^
    src/ast.cpp ^
    src/parser.cpp ^
    src/symbol_table.cpp ^
    src/semantic.cpp ^
    src/ir.cpp ^
    src/optimizer.cpp ^
    src/circuit.cpp ^
    src/truth_table.cpp ^
    src/verifier.cpp ^
    src/metrics.cpp ^
    src/compiler.cpp ^
    src/main.cpp ^
    -o bin/logicopt_compiler.exe

if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    exit /b %errorlevel%
)

echo [SUCCESS] Built bin/logicopt_compiler.exe successfully!

g++ -std=c++17 -Iinclude -O2 ^
    src/token.cpp ^
    src/lexer.cpp ^
    src/ast.cpp ^
    src/parser.cpp ^
    src/symbol_table.cpp ^
    src/semantic.cpp ^
    src/ir.cpp ^
    src/optimizer.cpp ^
    src/circuit.cpp ^
    src/truth_table.cpp ^
    src/verifier.cpp ^
    src/metrics.cpp ^
    src/compiler.cpp ^
    tests/test_runner.cpp ^
    -o bin/logicopt_tests.exe

if %errorlevel% neq 0 (
    echo [ERROR] Test build failed!
    exit /b %errorlevel%
)

echo [SUCCESS] Built bin/logicopt_tests.exe successfully!
