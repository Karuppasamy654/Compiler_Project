# LogicOpt — Compiler-Based Boolean Circuit Optimization and Synthesis Platform

**LogicOpt** is a production-quality, combinational Boolean compiler and logic synthesis engine built in C++17 with a FastAPI backend and React frontend. It translates custom Boolean Domain-Specific Language (DSL) source code into optimized digital logic gate circuits while verifying functional equivalence.

---

## 1. Project Overview

LogicOpt is designed strictly as a **Combinational Boolean Compiler and Logic Synthesis Platform**. It handles combinational logic parsing, semantic verification, intermediate representation (TAC), fixed-point Boolean optimization, dynamic circuit graph synthesis, Karnaugh map (K-Map) solving, technology mapping (NAND-Only & NOR-Only), and critical path timing analysis.

---

## 2. Architecture

```text
Source Code (.logic)
        ↓
    Lexer (Tokens, Line/Col Error Tracking)
        ↓
    Parser (AST Construction with Operator Precedence)
        ↓
    Symbol Table (Scope, Declaration, Assignment & Usage Tracking)
        ↓
    Semantic Analysis & Cycle Detection (DFS-based Topological Checking)
        ↓
    IR Generator (Three-Address Code / TAC Instructions)
        ↓
    Iterative Boolean Optimizer (Fixed-Point Transformation Rules)
        ↓
    Technology Mapper (NAND-Only and NOR-Only Gate Mapping)
        ↓
    Circuit Synthesis Engine (Topological Gate Graph & Depth Sorting)
        ↓
    Analysis Modules:
      ├─ Truth Table Evaluator (2^N Exhaustive Simulation)
      ├─ Equivalence Verification & Counterexample Engine
      ├─ K-Map Minimization Solver (2, 3, and 4 Variables)
      ├─ Critical Path & Delay Analyzer (Topological Delay Model)
      └─ Circuit Metrics Calculator
        ↓
    FastAPI HTTP Service (Safe Subprocess Binary Execution)
        ↓
    React Web IDE & Interactive Simulator (SVG Render, Drag & Live Simulation)
```

---

## 3. DSL Syntax

LogicOpt source files define signal declarations and logic assignment expressions:

```text
input a, b, cin;
output sum, cout;

wire axorb;

axorb = a XOR b;
sum = axorb XOR cin;
cout = (a AND b) OR (axorb AND cin);
```

### Supported Keywords & Operators:
- **Declarations**: `input`, `output`, `wire` (case-insensitive)
- **Boolean Constants**: `0`, `1`
- **Operators** (by precedence order):
  1. Parentheses `()`
  2. Unary: `NOT`
  3. Binary: `AND`, `NAND`
  4. Binary: `XOR`, `XNOR`
  5. Binary: `OR`, `NOR`

---

## 4. Compiler Pipeline

1. **Lexer**: Scans characters, handles comments (`//` and `/* */`), outputs tokens with exact line and column numbers.
2. **Parser**: Constructs a typed AST node tree enforcing Boolean operator precedence.
3. **Symbol Table & Semantic Analyzer**: Validates variable scopes, checks for read-only input assignments, duplicate declarations, duplicate assignments, unassigned wires/outputs, and detects combinational cycles.
4. **IR / TAC**: Emits Three-Address Code instructions (`t1 = a XOR b`, `sum = t1 XOR cin`).

---

## 5. Optimization Pass

The compiler executes an iterative, fixed-point optimization pass (up to 20 passes or until convergence):
- **Constant Folding & Annihilation**: `A AND 0 → 0`, `A OR 1 → 1`, `NOT 0 → 1`
- **Identity & Idempotent Laws**: `A AND 1 → A`, `A OR 0 → A`, `A AND A → A`, `A OR A → A`
- **Complement Laws**: `A AND NOT A → 0`, `A OR NOT A → 1`
- **Double Negation Law**: `NOT (NOT A) → A`
- **XOR / XNOR / NAND / NOR Laws**: `A XOR 0 → A`, `A XOR A → 0`, `A XNOR A → 1`
- **Constant & Variable Propagation**: Resolves alias chains and constant values.
- **Common Subexpression Elimination (CSE)**: Identifies duplicate gate computations across expression trees.
- **Dead Logic Elimination**: Removes unused intermediate logic signals.

---

## 6. Circuit Synthesis

Converts TAC instructions into a DAG netlist containing nodes for inputs, outputs, constants, and standard logic gates (`AND`, `OR`, `NOT`, `XOR`, `NAND`, `NOR`, `XNOR`). Computes topological depth for visual layout layering.

---

## 7. Verification & Counterexamples

Exhaustively simulates all $2^N$ input combinations for up to 10 input variables.
- If circuits produce identical output vectors across all combinations, reports **Equivalent**.
- If a mismatch occurs, generates a simulation-driven **Counterexample** identifying the exact input valuation and output divergence.
- If input space exceeds configured limit (10 variables), reports that exhaustive verification was skipped.

---

## 8. K-Map Solver

Generates Karnaugh Map grids for 2, 3, and 4 variable functions from actual circuit simulation:
- Calculates minterm values ($m_0, m_1, \dots$).
- Maps minterm cells using Gray code sequence (`00`, `01`, `11`, `10`).
- Groups minterms into visual prime implicants.

---

## 9. Technology Mapping

Transforms the optimized circuit into uniform single-gate target technologies:
- **NAND-Only Synthesis**: Maps all logic operators to equivalent NAND gate netlists.
- **NOR-Only Synthesis**: Maps all logic operators to equivalent NOR gate netlists.

---

## 10. Circuit Metrics & Timing

Calculates concrete structural metrics before and after optimization:
- Gate Count (per gate type)
- Wire Count & Intermediate Signals
- Topological Circuit Depth
- Fan-In and Fan-Out limits
- Critical Path Delay (estimated in nanoseconds based on gate propagation delays)

---

## 11. How to Build

### Building the C++ Compiler (Windows / MinGW / GCC)

```bash
cd compiler
build.bat
```

This compiles `bin/logicopt_compiler.exe` and `bin/logicopt_tests.exe`.

### Building with CMake

```bash
cd compiler
cmake -B build
cmake --build build
```

### Building the Frontend

```bash
cd frontend
npm install
npm run build
```

---

## 12. How to Run

### 1. Start FastAPI Backend

```bash
cd backend
python main.py
```
The server will run on `http://localhost:8000`.

### 2. Start React Web IDE

```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 13. How to Test

Run the C++ unit and regression test suite:

```bash
cd compiler
bin\logicopt_tests.exe
```

---

## 14. Examples

### Full Adder with Explicit Wires

```text
input a, b, cin;
output sum, cout;

wire axorb;

axorb = a XOR b;
sum = axorb XOR cin;
cout = (a AND b) OR (axorb AND cin);
```

### 2:1 Multiplexer

```text
input d0, d1, s;
output y;

wire s_not, term0, term1;
s_not = NOT s;
term0 = d0 AND s_not;
term1 = d1 AND s;
y = term0 OR term1;
```

---

## 15. Known Limitations

- **Purely Combinational**: Sequential elements (flip-flops, registers, clocks, state machines, FSMs) are intentionally out of scope.
- **Exhaustive Limit**: Exhaustive truth table simulation and verification is configured for up to 10 inputs ($2^{10} = 1024$ rows). Circuits with >10 inputs will gracefully report that exhaustive verification was skipped.
