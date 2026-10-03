from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List
from .compiler_service import run_compiler, get_compiler_path
from .examples import EXAMPLES

app = FastAPI(
    title="LogicOpt API",
    description="Backend API integration for C++17 LogicOpt Boolean Circuit Compiler",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CompileRequest(BaseModel):
    source: str

EXAMPLES = [
    {
        "id": "basic_and",
        "name": "Basic AND Gate",
        "description": "Simple 2-input AND logic circuit",
        "code": "input a, b;\noutput y;\n\ny = a AND b;\n"
    },
    {
        "id": "or_not",
        "name": "OR with NOT Gate",
        "description": "Expression demonstrating OR and unary NOT operations",
        "code": "input a, b;\noutput y;\n\ny = a OR NOT b;\n"
    },
    {
        "id": "xor_gate",
        "name": "XOR Gate",
        "description": "Exclusive OR logic circuit",
        "code": "input a, b;\noutput y;\n\ny = a XOR b;\n"
    },
    {
        "id": "half_adder",
        "name": "Half Adder",
        "description": "2-bit addition creating Sum (XOR) and Carry (AND)",
        "code": "input a, b;\noutput sum, carry;\n\nsum = a XOR b;\ncarry = a AND b;\n"
    },
    {
        "id": "full_adder",
        "name": "Full Adder",
        "description": "3-input full adder circuit with Carry-In and Carry-Out",
        "code": "input a, b, cin;\noutput sum, cout;\n\nwire axorb;\naxorb = a XOR b;\nsum = axorb XOR cin;\ncout = (a AND b) OR (axorb AND cin);\n"
    },
    {
        "id": "multiplexer",
        "name": "2:1 Multiplexer",
        "description": "Select signal s routing input d0 or d1 to output y",
        "code": "input d0, d1, s;\noutput y;\n\nwire s_not, term0, term1;\ns_not = NOT s;\nterm0 = d0 AND s_not;\nterm1 = d1 AND s;\ny = term0 OR term1;\n"
    },
    {
        "id": "constant_folding",
        "name": "Constant Folding & Identity",
        "description": "Demonstrates optimization of identity (a AND 1 -> a) and zero laws",
        "code": "input a;\noutput y;\n\ny = a AND 1;\n"
    },
    {
        "id": "common_subexpr",
        "name": "Common Subexpression",
        "description": "Demonstrates reuse of duplicate gate computations (CSE)",
        "code": "input a, b, c;\noutput x, y;\n\nx = (a AND b) OR c;\ny = (a AND b) XOR c;\n"
    },
    {
        "id": "dead_logic",
        "name": "Dead Logic Elimination",
        "description": "Demonstrates elimination of unused intermediate signals",
        "code": "input a, b;\noutput y;\n\nwire x, unused;\nx = a AND b;\nunused = a OR b;\n\ny = x;\n"
    },
    {
        "id": "redundant_logic",
        "name": "Complex Redundant Logic",
        "description": "Circuit with multiple identity, complement, and double negation laws",
        "code": "input a, b;\noutput y1, y2;\n\nwire t1, t2;\nt1 = NOT(NOT(a));\nt2 = b OR 0;\ny1 = t1 AND 1;\ny2 = t2 AND NOT(b);\n"
    }
]

@app.get("/api/health")
def health_check() -> Dict[str, Any]:
    bin_path = get_compiler_path()
    return {
        "status": "ok",
        "compiler_binary_found": bin_path.exists(),
        "compiler_binary_path": str(bin_path)
    }

@app.get("/api/examples")
def get_examples() -> List[Dict[str, Any]]:
    return EXAMPLES

@app.post("/api/compile")
def compile_code(req: CompileRequest) -> Dict[str, Any]:
    if not req.source.strip():
        return {
            "success": False,
            "errors": [{
                "type": "EmptySourceError",
                "message": "Source code cannot be empty.",
                "line": 1,
                "column": 1
            }],
            "warnings": []
        }
    return run_compiler(req.source)

@app.post("/api/validate")
def validate_code(req: CompileRequest) -> Dict[str, Any]:
    res = run_compiler(req.source)
    return {
        "success": res.get("success", False),
        "errors": res.get("errors", []),
        "warnings": res.get("warnings", []),
        "symbolTable": res.get("symbolTable", [])
    }

@app.post("/api/optimize")
def optimize_code(req: CompileRequest) -> Dict[str, Any]:
    res = run_compiler(req.source)
    return {
        "success": res.get("success", False),
        "ir": res.get("ir", []),
        "optimizedIr": res.get("optimizedIr", []),
        "optimizations": res.get("optimizations", []),
        "metrics": res.get("metrics", {})
    }

@app.post("/api/truth-table")
def get_truth_table(req: CompileRequest) -> Dict[str, Any]:
    res = run_compiler(req.source)
    return {
        "success": res.get("success", False),
        "truthTable": res.get("truthTable", {})
    }

@app.post("/api/verify")
def verify_code(req: CompileRequest) -> Dict[str, Any]:
    res = run_compiler(req.source)
    return {
        "success": res.get("success", False),
        "verification": res.get("verification", {})
    }
