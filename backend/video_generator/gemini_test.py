from dotenv import load_dotenv
import google.generativeai as genai
import os

# --- 1) Load your API key (No changes here) ---
load_dotenv(".env")
GEMINI_KEY = os.getenv("GEMINI_KEY")
if not GEMINI_KEY:
    raise RuntimeError("GEMINI_KEY not found. Put it in a local .env file.")
genai.configure(api_key=GEMINI_KEY)

def list_models():
    for i, m in zip(range(5), genai.list_models()):
        print(f"Name: {m.name} Description: {m.description} support: {m.supported_generation_methods}")

if __name__ == "__main__":
    list_models()