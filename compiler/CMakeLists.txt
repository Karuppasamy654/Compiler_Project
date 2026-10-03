cmake_minimum_required(VERSION 3.14)
project(LogicOptCompiler CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

set(COMPILER_SOURCES
    src/token.cpp
    src/lexer.cpp
    src/ast.cpp
    src/parser.cpp
    src/symbol_table.cpp
    src/semantic.cpp
    src/ir.cpp
    src/optimizer.cpp
    src/circuit.cpp
    src/truth_table.cpp
    src/verifier.cpp
    src/metrics.cpp
    src/compiler.cpp
)

add_executable(logicopt_compiler src/main.cpp ${COMPILER_SOURCES})

add_executable(logicopt_tests tests/test_runner.cpp ${COMPILER_SOURCES})
