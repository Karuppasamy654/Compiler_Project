import os
import subprocess
import json
from pathlib import Path
from typing import Dict, Any

# Path to C++ compiler binary
BASE_DIR = Path(__file__).resolve().parent.parent.parent
COMPILER_BIN_WIN = BASE_DIR / "compiler" / "bin" / "logicopt_compiler.exe"
COMPILER_BIN_ALT = BASE_DIR / "compiler" / "build" / "logicopt_compiler.exe"
COMPILER_BIN_NIX = BASE_DIR / "compiler" / "bin" / "logicopt_compiler"

def get_compiler_path() -> Path:
    if COMPILER_BIN_WIN.exists():
        return COMPILER_BIN_WIN
    if COMPILER_BIN_ALT.exists():
        return COMPILER_BIN_ALT
    if COMPILER_BIN_NIX.exists():
        return COMPILER_BIN_NIX
    return COMPILER_BIN_WIN

def run_compiler(source_code: str, timeout_seconds: int = 5) -> Dict[str, Any]:
    bin_path = get_compiler_path()
    if not bin_path.exists():
        return {
            "success": False,
            "errors": [{
                "type": "CompilerNotFoundError",
                "message": f"C++ LogicOpt compiler executable not found at {bin_path}. Please build the compiler first.",
                "line": 1,
                "column": 1
            }],
            "warnings": []
        }

    try:
        process = subprocess.run(
            [str(bin_path)],
            input=source_code,
            text=True,
            capture_output=True,
            timeout=timeout_seconds,
            encoding="utf-8"
        )
        if process.returncode != 0 and not process.stdout:
            return {
                "success": False,
                "errors": [{
                    "type": "CompilerExecutionError",
                    "message": process.stderr or "Compiler process exited with non-zero status.",
                    "line": 1,
                    "column": 1
                }],
                "warnings": []
            }
        
        result_json = json.loads(process.stdout)
        return result_json
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "errors": [{
                "type": "TimeoutError",
                "message": f"Compilation timed out after {timeout_seconds} seconds.",
                "line": 1,
                "column": 1
            }],
            "warnings": []
        }
    except json.JSONDecodeError as e:
        return {
            "success": False,
            "errors": [{
                "type": "OutputParseError",
                "message": f"Failed to parse compiler JSON output: {str(e)}",
                "line": 1,
                "column": 1
            }],
            "warnings": []
        }
    except Exception as e:
        return {
            "success": False,
            "errors": [{
                "type": "ServerError",
                "message": str(e),
                "line": 1,
                "column": 1
            }],
            "warnings": []
        }
