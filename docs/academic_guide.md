# LogicOpt — Academic Guide & Compiler Design Presentation

## Overview & Academic Contribution
**LogicOpt** is a custom domain-specific language (DSL) compiler implemented in **C++17** that translates high-level Boolean logic descriptions into optimized digital circuit graphs while guaranteeing functional equivalence.

---

## Compiler Pipeline Architecture

```text
Source Code (.logic)
        ↓
1. Lexical Analysis (Lexer) ----------> Tokens (Location-Aware)
        ↓
2. Syntax Analysis (Parser) ----------> Abstract Syntax Tree (AST)
        ↓
3. Semantic Analysis & Symbol Table --> Symbol Table & Dependency Graph (Cycle Check)
        ↓
4. Intermediate Representation (IR) --> Three-Address Code (TAC)
        ↓
5. Optimization Engine ---------------> Fixed-Point Iterative Optimization Passes
        ↓
6. Target / Circuit Synthesis --------> Circuit Graph & Depth Metrics
        ↓
7. Verification & Truth Table --------> Exhaustive Truth Table & Equivalence Verification
```

---

## Detailed Stage Breakdown

### 1. Lexical Analysis (Scanning)
- **C++ Class**: `logicopt::Lexer`
- **Role**: Reads raw source stream and breaks it down into a stream of tokens (`INPUT`, `OUTPUT`, `WIRE`, `AND`, `OR`, `NOT`, `XOR`, `NAND`, `NOR`, `XNOR`, `IDENTIFIER`, `CONSTANT_0`, `CONSTANT_1`, `ASSIGN`, `SEMICOLON`, `COMMA`, `LPAREN`, `RPAREN`).
- **Features**: Preserves line and column coordinates for accurate compiler error diagnostic reports.

### 2. Syntax Analysis (Parsing)
- **C++ Class**: `logicopt::Parser`
- **Grammar**: Operator-precedence recursive-descent parser.
- **Precedence Order** (Highest to Lowest):
  1. Parentheses `()`
  2. Unary `NOT`
  3. `AND`, `NAND`
  4. `XOR`, `XNOR`
  5. `OR`, `NOR`
- **Output**: Hierarchical Abstract Syntax Tree (AST).

### 3. Semantic Analysis & Symbol Table
- **C++ Class**: `logicopt::SemanticAnalyzer` & `logicopt::SymbolTable`
- **Role**: Type checking, scope management, and validation.
- **Checks Performed**:
  - Duplicate declarations (e.g. `input a; wire a;`)
  - Undeclared signal usages (e.g. `y = x AND b;` where `x` is undeclared)
  - Illegal input assignment (e.g. `input a; a = 1;`)
  - Multiple assignments to the same wire/output
  - Missing output assignments
  - Unused wires warnings
  - **Circular Dependency Detection**: DFS graph traversal on target dependency graph to prevent feedback loops in combinational logic (e.g. `a = b; b = a;`).

### 4. Intermediate Code Generation (IR)
- **C++ Class**: `logicopt::IRGenerator`
- **Format**: Three-Address Code (TAC) instructions.
- **Structure**: `result = arg1 OP arg2` (using temporary variables `t1`, `t2`, ...).

### 5. Boolean Optimization Engine
- **C++ Class**: `logicopt::Optimizer`
- **Techniques Implemented**:
  - **Constant Folding**: `a AND 0 → 0`, `a OR 1 → 1`, `NOT 0 → 1`
  - **Identity Laws**: `a AND 1 → a`, `a OR 0 → a`
  - **Idempotent Laws**: `a AND a → a`, `a OR a → a`
  - **Complement Laws**: `a AND NOT a → 0`, `a OR NOT a → 1`
  - **Double Negation**: `NOT(NOT(a)) → a`
  - **XOR / XNOR / NAND / NOR Simplifications**: `a XOR 0 → a`, `a XOR a → 0`, `a NAND 1 → NOT a`
  - **Common Subexpression Elimination (CSE)**: Reuses identical previously computed logic gates.
  - **Constant Propagation**: Replaces signals bound to constants `0`/`1` or aliases across instructions.
  - **Dead Logic Elimination**: Backwards dependency traversal starting from output signals to remove unneeded logic.

### 6. Circuit Synthesis & Metric Analysis
- **C++ Class**: `logicopt::CircuitGenerator` & `logicopt::MetricsCalculator`
- **Role**: Synthesizes gate-level digital circuit graphs (nodes and directional edges).
- **Depth Calculation**: Topological graph sorting to compute logical circuit depth.
- **Metrics**: Total gates, gate breakdown by type, depth reduction percentage.

### 7. Verification & Truth Table Evaluation
- **C++ Class**: `logicopt::TruthTableEvaluator` & `logicopt::EquivalenceChecker`
- **Role**: Exhaustive $2^N$ evaluation of original vs optimized circuit representations.
- **Equivalence Check**: Validates that optimization transformations never alter circuit truth table outputs. Generates counterexamples if a mismatch is detected.
