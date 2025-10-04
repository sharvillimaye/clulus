# llm_client.py
import json

def ask_llm(question: str) -> str:
    """
    Return JSON string matching Lesson schema.
    Wire this to OpenAI/Anthropic/etc. For now, a mock demo.
    """
    # DEMO fallback: derivative question heuristic
    if "derivative" in question.lower():
        data = {
            "title": r"Derivative of $e^x + 3x^2$",
            "steps": [
                r"f(x) = e^x + 3x^2",
                r"f'(x) = \frac{d}{dx} \big(e^x\big) + \frac{d}{dx}\big(3x^2\big)",
                r"f'(x) = e^x + 6x"
            ],
            "function_tex": r"e^x + 3x^2",
            "x_min": -2,
            "x_max": 2
        }
    else:
        data = {
          "title": "Integral of $\\sin(x)$",
          "steps": [
            r"\int \sin(x)\,dx",
            r"= -\cos(x) + C"
          ],
          "function_tex": r"\sin(x)",
          "x_min": -3,
          "x_max": 3
        }
    return json.dumps(data)
