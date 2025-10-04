# app.py
import os, json, subprocess, sys
from pathlib import Path
from llm_client import ask_llm
from lesson_schema import Lesson

BUILD = Path("build")
BUILD.mkdir(exist_ok=True)

def compile_manim(json_path: Path, quality: str = "h", out_name: str = None) -> Path:
    assert json_path.exists()
    out_name = out_name or "lesson"
    out_path = BUILD / f"{out_name}.mp4"

    env = os.environ.copy()
    # Make 100% sure TeX is on PATH for the manim subprocess
    texbin = "/Library/TeX/texbin"
    env["PATH"] = f"{texbin}:{env.get('PATH','')}"
    env["LESSON_JSON"] = str(json_path.resolve())

    cmd = [
        "manim", f"-q{quality}", "-o", out_path.name,
        "render_scene.py", "LessonScene",
        "--disable_caching"
    ]
    print("Running:", " ".join(cmd))
    proc = subprocess.run(cmd, env=env)
    if proc.returncode != 0:
        raise RuntimeError("Manim render failed.")
    return out_path

def main():
    # (1) Ask user
    if len(sys.argv) > 1:
        question = " ".join(sys.argv[1:])
    else:
        question = input("Enter a math question: ").strip()

    # (2) LLM → JSON
    json_str = ask_llm(question)

    # (3) Validate schema
    data = json.loads(json_str)
    lesson = Lesson.model_validate(data)

    # Sacve JSON for the scene to read
    json_path = BUILD / "lesson.json"
    with open(json_path, "w") as f:
        json.dump(lesson.model_dump(), f, indent=2)

    # (4) Compile to video
    mp4 = compile_manim(json_path, quality="h", out_name="lesson")
    print(f"\n✅ Done: {mp4.resolve()}")

if __name__ == "__main__":
    main()
