import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
from app.compiler_service import run_compiler, get_compiler_path
from app.examples import EXAMPLES

class LogicOptRequestHandler(BaseHTTPRequestHandler):

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/health":
            bin_path = get_compiler_path()
            data = {
                "status": "ok",
                "compiler_binary_found": bin_path.exists(),
                "compiler_binary_path": str(bin_path)
            }
            self.send_json(200, data)
        elif path == "/api/examples":
            self.send_json(200, EXAMPLES)
        else:
            self.send_json(404, {"error": "Endpoint not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else ""

        try:
            req_data = json.loads(body) if body else {}
        except json.JSONDecodeError:
            req_data = {}

        source = req_data.get("source", "")

        if path in ["/api/compile", "/api/validate", "/api/optimize", "/api/truth-table", "/api/verify"]:
            if not source.strip():
                result = {
                    "success": False,
                    "errors": [{
                        "type": "EmptySourceError",
                        "message": "Source code cannot be empty.",
                        "line": 1,
                        "column": 1
                    }],
                    "warnings": []
                }
            else:
                result = run_compiler(source)

            if path == "/api/validate":
                res = {
                    "success": result.get("success", False),
                    "errors": result.get("errors", []),
                    "warnings": result.get("warnings", []),
                    "symbolTable": result.get("symbolTable", [])
                }
                self.send_json(200, res)
            elif path == "/api/optimize":
                res = {
                    "success": result.get("success", False),
                    "ir": result.get("ir", []),
                    "optimizedIr": result.get("optimizedIr", []),
                    "optimizations": result.get("optimizations", []),
                    "metrics": result.get("metrics", {})
                }
                self.send_json(200, res)
            elif path == "/api/truth-table":
                res = {
                    "success": result.get("success", False),
                    "truthTable": result.get("truthTable", {})
                }
                self.send_json(200, res)
            elif path == "/api/verify":
                res = {
                    "success": result.get("success", False),
                    "verification": result.get("verification", {})
                }
                self.send_json(200, res)
            else:
                # /api/compile
                self.send_json(200, result)
        else:
            self.send_json(404, {"error": "Endpoint not found"})

    def send_json(self, status_code: int, data: dict):
        self.send_response(status_code)
        self._send_cors_headers()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        response_bytes = json.dumps(data, indent=2).encode("utf-8")
        self.wfile.write(response_bytes)

def run_server(host="0.0.0.0", port=8000):
    server = HTTPServer((host, port), LogicOptRequestHandler)
    print(f"LogicOpt Backend Server running on http://{host}:{port} ...")
    server.serve_forever()
