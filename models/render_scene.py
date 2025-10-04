# render_scene.py
import json, os, math
from manim import *
from lesson_schema import Lesson
from sympy import symbols, sympify, lambdify
import numpy as np
import sympy as sp
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
    convert_xor,
)

TRANSFORMS = standard_transformations + (
    implicit_multiplication_application,  # "3x" -> 3*x
    convert_xor,                          # "^"   -> "**"
)

SAFE_LOCALS = {
    # constants
    "e": sp.E, "E": sp.E, "pi": sp.pi,
    # common functions
    "sin": sp.sin, "cos": sp.cos, "tan": sp.tan,
    "asin": sp.asin, "acos": sp.acos, "atan": sp.atan,
    "sinh": sp.sinh, "cosh": sp.cosh, "tanh": sp.tanh,
    "exp": sp.exp, "log": sp.log, "ln": sp.log, "sqrt": sp.sqrt,
    "abs": sp.Abs,
}

LATEX_REPLACEMENTS = (
    (r"\cdot", "*"), (r"\times", "*"),
    (r"\left", ""), (r"\right", ""),
    ("{", "("), ("}", ")"),
    (r"\exp", "exp"),
    ("\\,", ""), ("\\!", ""), ("\\;", ""), ("\\:", ""),  # spacing
)

def to_sympy_expr(s: str) -> sp.Expr:
    """Parse user/LLM string into a SymPy expression."""
    s = s.strip()
    # tolerate simple LaTeX-ish inputs
    for a, b in LATEX_REPLACEMENTS:
        s = s.replace(a, b)
    # Common “e^x” pattern → exp(x) (helps before parse_expr)
    # Only when 'e^' is used (not variables like 'e*x')
    s = s.replace("e^(", "exp(")
    # handle e^x without parentheses
    s = s.replace("e^x", "exp(x)")

    # Now parse with implicit multiplication and ^→**
    x = sp.symbols("x")
    expr = parse_expr(
        s,
        transformations=TRANSFORMS,
        local_dict={**SAFE_LOCALS, "x": x},
        evaluate=True,
    )
    return expr

class LessonScene(Scene):
    def construct(self):
        json_path = os.environ.get("LESSON_JSON")
        if not json_path or not os.path.exists(json_path):
            raise FileNotFoundError("LESSON_JSON env var must point to a lesson JSON file.")
        with open(json_path, "r") as f:
            raw = json.load(f)
        lesson = Lesson.model_validate(raw)

        # Title
        title = Tex(lesson.title, font_size=48)
        title.to_edge(UP)
        self.play(Write(title), run_time=1.5)
        self.wait(0.3)

        # Steps
        lines = VGroup(*[MathTex(s, font_size=36) for s in lesson.steps])
        lines.arrange(DOWN, aligned_edge=LEFT, buff=0.5).next_to(title, DOWN).to_edge(LEFT, buff=0.8)

        for i, step in enumerate(lines):
            self.play(Write(step), run_time=1.2)
            self.wait(0.2)
            if i == len(lines) - 1:
                self.play(Indicate(step, scale_factor=1.1), run_time=0.6)
                self.wait(0.2)

        # Optional graph
        if lesson.function_tex:
            axes = Axes(
                x_range=[lesson.x_min, lesson.x_max, 1],
                y_range=[-5, 15, 1],
                x_length=8,
                y_length=4,
                tips=False,
                axis_config={"include_numbers": True, "font_size": 24},
            ).to_edge(DOWN).shift(DOWN*0.2)
            self.play(Create(axes), run_time=0.8)

            # inside LessonScene.construct(), in the "Optional graph" section
            x = sp.symbols("x")
            try:
                expr = to_sympy_expr(lesson.function_tex)
                f = sp.lambdify(x, expr, modules=["numpy"])  # robust + fast

                def f_scalar(t):
                    try:
                        return float(f(t))
                    except Exception:
                        return np.nan  # let axes.plot handle gaps

                graph = axes.plot(f_scalar, x_range=[lesson.x_min, lesson.x_max], stroke_width=4)
                label = MathTex(r"f(x) = " + lesson.function_tex, font_size=32).next_to(axes, UP)
                self.play(Create(graph), FadeIn(label), run_time=1.2)
                self.wait(0.5)
            except Exception as e:
                err = Text(f"Parse error: {e}", font_size=24, color=RED).next_to(axes, UP)
                self.play(FadeIn(err))
                self.wait(0.5)

        self.wait(0.5)