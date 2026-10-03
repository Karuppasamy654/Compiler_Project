EXAMPLES = [
    {
        "id": "01_and_gate",
        "name": "01 - AND Gate",
        "description": "Simple 2-input AND logic expression",
        "code": "INPUT A, B\nOUTPUT Y\n\nY = A AND B\n"
    },
    {
        "id": "02_or_gate",
        "name": "02 - OR Gate",
        "description": "Simple 2-input OR logic expression",
        "code": "INPUT A, B\nOUTPUT Y\n\nY = A OR B\n"
    },
    {
        "id": "03_not_gate",
        "name": "03 - NOT Gate",
        "description": "Unary NOT inverter expression",
        "code": "INPUT A\nOUTPUT Y\n\nY = NOT A\n"
    },
    {
        "id": "04_xor_gate",
        "name": "04 - XOR Gate",
        "description": "Exclusive OR logic expression",
        "code": "INPUT A, B\nOUTPUT Y\n\nY = A XOR B\n"
    },
    {
        "id": "05_simple_circuit",
        "name": "05 - Simple Circuit",
        "description": "Combined expression without requiring wire declarations",
        "code": "INPUT A, B, C\nOUTPUT Y\n\nY = (A AND B) OR NOT C\n"
    },
    {
        "id": "06_full_adder",
        "name": "06 - Full Adder",
        "description": "3-input full adder circuit computing SUM and CARRY",
        "code": "INPUT A, B, CIN\nOUTPUT SUM, CARRY\n\nSUM = A XOR B XOR CIN\nCARRY = (A AND B) OR (B AND CIN) OR (A AND CIN)\n"
    },
    {
        "id": "07_optimization",
        "name": "07 - Optimization",
        "description": "Demonstrates identity law optimization (A AND 1 -> A)",
        "code": "INPUT A\nOUTPUT Y\n\nY = A AND 1\n"
    },
    {
        "id": "08_nested_logic",
        "name": "08 - Nested Logic",
        "description": "Multi-level nested Boolean logic expression",
        "code": "INPUT A, B, C, D\nOUTPUT Y\n\nY = ((A AND B) OR C) XOR NOT D\n"
    }
]
