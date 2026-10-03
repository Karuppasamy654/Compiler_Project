# LogicOpt — C++17 Compiler-Based Boolean Circuit Optimization & Synthesis Platform

**LogicOpt** is a production-quality academic compiler platform that translates a custom Boolean Domain-Specific Language (DSL) into optimized digital logic circuits while exhaustively verifying functional equivalence.

---

## 🚀 Key Features

* **Real C++17 Compiler Core**:
  * **Lexical Analyzer**: Tokenizes input with line/column tracking.
  * **Recursive-Descent Parser**: Builds an Abstract Syntax Tree (AST) with precedence (`NOT` > `AND`/`NAND` > `XOR`/`XNOR` > `OR`/`NOR`).
  * **Symbol Table & Semantic Analyzer**: Scope checking, type checking, signal usage validation, and DFS-based **Circular Dependency Detection**.
  * **Intermediate Representation (IR)**: Three-Address Code (TAC) generation.
  * **Iterative Boolean Optimizer**:
    * Constant Folding (`a AND 0 → 0`, `a OR 1 → 1`)
    * Identity Laws (`a AND 1 → a`, `a OR 0 → a`)
    * Idempotent Laws (`a AND a → a`, `a OR a → a`)
    * Complement Laws (`a AND NOT a → 0`, `a OR NOT a → 1`)
    * Double Negation (`NOT(NOT(a)) → a`)
    * XOR / XNOR / NAND / NOR Simplifications
    * Common Subexpression Elimination (CSE)
    * Constant Propagation
    * Dead Logic Elimination
  * **Circuit Synthesis Engine**: Generates gate graph, computes logical circuit depth via topological sorting.
  * **Exhaustive Verification & Truth Table Engine**: Evaluates original vs. optimized circuits and verifies functional equivalence.
* **FastAPI Backend Integration**: Safe subprocess execution of the C++ compiler.
* **React Web IDE Interface**:
  * Monaco Editor integration with custom syntax highlighting.
  * Interactive Circuit Visualizer (zoom/pan/selection).
  * Tabbed inspection: Tokens, AST, Symbol Table, IR, Optimized IR, Original/Optimized Circuits, Truth Table, Verification, Metrics, Optimization Log, Errors.
  * Export options: Source code, Full JSON result, IR, Truth Table CSV, Verilog (.v).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Compiler Core** | C++17, STL, `nlohmann/json` header, CMake / GCC |
| **Backend Integration** | Python 3.14+, FastAPI, Pydantic, Subprocess |
| **Frontend UI** | React 18, Vite, Monaco Editor, Lucide Icons |

---

## ⚡ Quick Start & Build Instructions

### 1. Build & Test the C++ Compiler

```bash
cd compiler

# Build using provided script (GCC/g++)
build.bat

# Run automated C++ unit tests
bin\logicopt_tests.exe
```

Or using CMake:

```bash
cd compiler
cmake -B build
cmake --build build
```

### 2. Run the FastAPI Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend will start at `http://localhost:8000`.

### 3. Run the React Web Interface

```bash
cd frontend
npm install
npm run dev
```

Frontend will start at `http://localhost:5173`.

---

## 📝 LogicOpt DSL Example

```text
input a, b, cin;
output sum, cout;

wire axorb;

axorb = a XOR b;
sum = axorb XOR cin;
cout = (a AND b) OR (axorb AND cin);
```

---

## 🧪 Verification & Academic Integrity

The project strictly abides by compiler design principles:
- **Zero hardcoded compiler outputs or fake data**.
- All ASTs, IRs, gate graphs, truth tables, metrics, and equivalence check results are computed live by the C++17 compiler binary.
