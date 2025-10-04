# llm_client.py
import json
import os
from typing import Any, Dict

from dotenv import load_dotenv
import google.generativeai as genai
from google.generativeai.types import GenerationConfig, Tool, FunctionDeclaration

from lesson_schema import Lesson

# --- 1) Load your API key ---
load_dotenv("../../.env")
GEMINI_KEY = os.getenv("GEMINI_KEY")
if not GEMINI_KEY:
    raise RuntimeError("GEMINI_KEY not found. Put it in a local .env file.")

genai.configure(api_key=GEMINI_KEY)

# --- 2) Pick a model ---
MODEL_NAME = "gemini-2.5-flash"

# --- 3) JSON Schema ---
JSON_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "title": {
            "type": "string",
            "description": "A short LaTeX-friendly title for the lesson. May contain inline math like $e^x$."
        },
        "steps": {
            "type": "array",
            "items": {"type": "string"},
            "description": "An ordered list of strings. Each string is a self-contained LaTeX math expression WITHOUT surrounding '$' or '$$' delimiters. For example, a valid step is 'f(x)=x^2+1', not '$f(x)=x^2+1$'. Maximum of 85 characters. Maximum of 3 steps."
        },
        "function_plots": {
            "type": "array",
            "description": "A list of functions to plot on the same graph, with a maximum of 2 items.",
            "items": {
                "type": "object",
                "properties": {
                    "expression": {"type": "string", "description": "The mathematical expression to plot, e.g., 'x**2 - 3*x'."},
                    "label": {"type": "string", "description": "The LaTeX label for the function in the plot legend, e.g., 'f(x)'."}
                },
                "required": ["expression", "label"]
            }
        },
        "x_min": {
            "type": "number",
            "description": "The minimum value for the plot's x-axis. Required if plots are provided."
        },
        "x_max": {
            "type": "number",
            "description": "The maximum value for the plot's x-axis. Required if plots are provided."
        }
    },
    "required": ["title", "steps"],
}

# --- 4) System/style prompt ---
SYSTEM_INSTRUCTION = (
    "You are a helpful and concise math explainer.\n"
    "Given a user's math question, you MUST call the `submit_lesson` function\n"
    "to provide a structured response with a title and step-by-step solution.\n"
    "CRITICAL RULES:\n"
    "1. Use simple LaTeX and keep each step concise and purely mathematical.\n"
    "2. For questions involving functions (like derivatives), use `function_plots` to plot BOTH the original function and the final result (max 2 plots). Label them appropriately (e.g., 'f(x)' and 'f\\'(x)').\n"
    "3. The `steps` array must contain a maximum of 3 steps.\n"
    "4. Each string in the `steps` array must be a maximum of 85 characters long.\n"
    "5. Each string in the `steps` array must be a complete math expression and MUST NOT be wrapped in '$' or '$$'.\n"
    "6. The title can contain inline '$...$' math, but the steps cannot."
)

# --- 5) Few-shot examples (No changes needed, they perfectly demonstrate when to plot) ---
FEW_SHOT = [
    {
        "role": "user",
        "parts": [{"text": "Find the derivative of e^x + 3x^2"}],
    },
    {
        "role": "model",
        "parts": [{
            "text": json.dumps({
                "title": r"Derivative of $e^x + 3x^2$",
                "steps": [
                    r"f(x)=e^x+3x^2",
                    r"f'(x)=\frac{d}{dx}(e^x)+\frac{d}{dx}(3x^2)",
                    r"f'(x)=e^x+6x"
                ],
                "function_plots": [
                    {
                        "expression": "e**x + 3*x**2",
                        "label": "f(x)"
                    },
                    {
                        "expression": "e**x + 6*x",
                        "label": "f'(x)"
                    }
                ],
                "x_min": -2,
                "x_max": 2
            })
        }],
    },
    {
        "role": "user",
        "parts": [{"text": "Solve for x: x^2 - 5x + 6 = 0"}],
    },
    {
        "role": "model",
        "parts": [{
            "text": json.dumps({
                "title": r"Roots of $x^2-5x+6$",
                "steps": [
                    r"x^2-5x+6=0",
                    r"(x-2)(x-3)=0",
                    r"x=2 \text{ or } x=3"
                ]
            })
        }],
    },
]


def _build_model():
    """Builds the GenerativeModel with the required tool."""
    lesson_tool = Tool(
        function_declarations=[
            FunctionDeclaration(
                name="submit_lesson",
                description="Submits a structured math lesson with a title, steps, and optional plotting info.",
                parameters=JSON_SCHEMA,
            )
        ]
    )
    generation_config = GenerationConfig(temperature=0.2, top_p=0.9, top_k=40)
    return genai.GenerativeModel(
        MODEL_NAME,
        system_instruction=SYSTEM_INSTRUCTION,
        generation_config=generation_config,
        tools=[lesson_tool],
    )


MODEL = _build_model()


def _convert_to_json_serializable(obj):
    """Recursively convert objects to JSON-serializable types."""
    if hasattr(obj, '__class__') and 'RepeatedComposite' in str(obj.__class__):
        return list(obj)
    elif isinstance(obj, dict):
        return {key: _convert_to_json_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [_convert_to_json_serializable(item) for item in obj]
    elif hasattr(obj, '__iter__') and not isinstance(obj, (str, bytes)):
        try:
            return list(obj)
        except TypeError:
            return str(obj)
    else:
        return obj


def _validate_or_raise(data: Dict[str, Any]) -> Lesson:
    """
    Validates the dictionary against the Pydantic model and returns the model instance.
    Pydantic's `model_validate` is smart enough to handle the API's special types.
    """
    try:
        # Pydantic parses the raw dict (with MapComposite) and creates a clean model
        lesson_instance = Lesson.model_validate(data)
        return lesson_instance
    except Exception as e:
        raise ValueError(f"Pydantic validation failed: {e}")


def ask_llm(question: str) -> str:
    """
    Calls Gemini and returns a JSON string matching Lesson schema.
    Uses the modern Tool Calling API for reliable, structured output.
    Will retry once with a repair message if the first output isn't valid.
    """
    if question.strip() == "-debug previous":
        debug_path = "./build/lesson.json"
        try:
            with open(debug_path, "r") as f:
                data = json.load(f)
            validated_data = _validate_or_raise(data)
            return json.dumps(validated_data)
        except FileNotFoundError:
            return json.dumps({"title": "Error", "steps": [f"Debug file not found: {debug_path}"]})
        except Exception as e:
            return json.dumps({"title": "Error", "steps": [f"Failed to load or validate debug file: {e}"]})

    convo = FEW_SHOT + [{"role": "user", "parts": [{"text": question}]}]
    tool_config = {"function_calling_config": "any"}

    try:
        resp = MODEL.generate_content(convo, tool_config=tool_config)
        function_call = resp.candidates[0].content.parts[0].function_call
        if not function_call:
            raise ValueError("Model did not return a function call.")

        # 1. Get raw dictionary-like object from the API
        data = dict(function_call.args)

        # 2. Validate and get a clean Pydantic model instance
        lesson_instance = _validate_or_raise(data)

        # 3. Use .model_dump() to get a JSON-serializable dictionary
        serializable_data = lesson_instance.model_dump()

        # Save and return the clean, serializable data
        os.makedirs("./build", exist_ok=True)
        with open("./build/lesson.json", "w") as f:
            json.dump(serializable_data, f, indent=2)
        return json.dumps(serializable_data)

    except Exception as e1:
        print(f"First attempt failed: {e1}. Retrying...")

        repair_msg = (
            "Your previous response was invalid or the API call failed. "
            f"Error: {e1}. "
            "You MUST call the `submit_lesson` function with the correct parameters that fulfill the schema."
        )
        convo.append({"role": "user", "parts": [{"text": repair_msg}]})

        # Second attempt follows the same clean logic
        resp2 = MODEL.generate_content(convo, tool_config=tool_config)
        function_call_2 = resp2.candidates[0].content.parts[0].function_call
        if not function_call_2:
            raise ValueError("Model did not return a function call on retry.")

        data2 = dict(function_call_2.args)
        lesson_instance2 = _validate_or_raise(data2)
        serializable_data2 = lesson_instance2.model_dump()

        os.makedirs("./build", exist_ok=True)
        with open("./build/lesson.json", "w") as f:
            json.dump(serializable_data2, f, indent=2)
        return json.dumps(serializable_data2)