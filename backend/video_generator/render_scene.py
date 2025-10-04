# render_scene.py
import json, os
import re
import numpy as np
import sympy as sp
from manim import *
from lesson_schema import Lesson
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
    convert_xor,
)

# Try LaTeX parser if available
try:
    from sympy.parsing.latex import parse_latex
    _HAS_PARSE_LATEX = True
except Exception:
    _HAS_PARSE_LATEX = False

TRANSFORMS = standard_transformations + (
    implicit_multiplication_application,  # "3x" -> 3*x
    convert_xor,                          # "^"   -> "**"
)

SAFE_LOCALS = {
    "e": sp.E, "E": sp.E, "pi": sp.pi,
    "sin": sp.sin, "cos": sp.cos, "tan": sp.tan,
    "asin": sp.asin, "acos": sp.acos, "atan": sp.atan,
    "sinh": sp.sinh, "cosh": sp.cosh, "tanh": sp.tanh,
    "sec": sp.sec, "csc": sp.csc, "cot": sp.cot,
    "exp": sp.exp, "log": sp.log, "ln": sp.log, "sqrt": sp.sqrt,
    "abs": sp.Abs,
}

_LATEX_SPACING = re.compile(r"\\[,\!\;\:\s]")

def _normalize_latex(s: str) -> str:
    # Handle \frac{a}{b} -> (a)/(b) (repeat to unwrap nested)
    frac_pat = re.compile(r"\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}")
    while True:
        s2 = re.sub(frac_pat, r"(\1)/(\2)", s)
        if s2 == s:
            break
        s = s2

    # \sin^2 x, \cos^{3}(x) -> (sin(x))**2, (cos(x))**3
    s = re.sub(
        r"\\(?P<fn>sin|cos|tan|sec|csc|cot|sinh|cosh|tanh)\s*\^\s*(?P<p>\d+)\s*\(?\s*(?P<a>[A-Za-z0-9_]+)\s*\)?",
        r"(\g<fn>(\g<a>))**\g<p>", s)

    # Convert \fn(x) / \fn x -> fn(x)
    for fn in ["sin","cos","tan","sec","csc","cot","sinh","cosh","tanh","exp","log","ln","sqrt","abs"]:
        s = re.sub(rf"\\{fn}\s*\(", f"{fn}(", s)
        s = re.sub(rf"\\{fn}\s+([A-Za-z0-9_]+)", rf"{fn}(\1)", s)

    # Constants, operators, wrappers
    s = s.replace(r"\pi", "pi").replace(r"\mathrm{e}", "e")
    s = s.replace(r"\cdot", "*").replace(r"\times", "*")
    s = s.replace(r"\left", "").replace(r"\right", "")
    s = _LATEX_SPACING.sub("", s)

    # As a last step, brace → parenthesis (helps with x^{2} etc.)
    s = s.replace("{", "(").replace("}", ")")
    return s.strip()

def to_sympy_expr(s: str) -> sp.Expr:
    s = s.strip()
    x = sp.symbols("x")

    # 1) Try proper LaTeX parse
    if _HAS_PARSE_LATEX:
        try:
            return parse_latex(s)
        except Exception:
            pass  # fall back below

    # 2) Normalize common LaTeX → plain math
    s = _normalize_latex(s)

    # 3) Minor conveniences: e^x → e**x is handled by convert_xor; we map e→E
    expr = parse_expr(
        s,
        transformations=TRANSFORMS,
        local_dict={**SAFE_LOCALS, "x": x},
        evaluate=True,
    )
    return expr

def create_geometric_shape(shape_data):
    """Create a Manim geometric shape from shape data."""
    shape_type = shape_data.shape_type
    position = shape_data.position
    size = shape_data.size or 1.0  # Default size if None
    
    # Scale down the size to fit better on screen (Manim screen is roughly 14x8 units)
    scale_factor = 0.4  # Make shapes much smaller
    size = size * scale_factor
    
    # Handle color mapping
    color_map = {
        "BLUE": BLUE, "RED": RED, "GREEN": GREEN, "YELLOW": YELLOW,
        "ORANGE": ORANGE, "PURPLE": PURPLE, "PINK": PINK, "GRAY": GRAY,
        "WHITE": WHITE, "BLACK": BLACK
    }
    color = color_map.get(shape_data.color, BLUE)
    
    fill_opacity = shape_data.fill_opacity or 0.3
    stroke_width = shape_data.stroke_width or 2.0
    
    # Convert position to Manim coordinates (scale down positions too)
    x, y = position[0] * 0.3, position[1] * 0.3  # Scale down positions more
    
    if shape_type == "square":
        shape = Square(side_length=size, color=color, fill_opacity=fill_opacity, stroke_width=stroke_width)
    elif shape_type == "circle":
        shape = Circle(radius=size, color=color, fill_opacity=fill_opacity, stroke_width=stroke_width)
    elif shape_type == "triangle":
        # Create equilateral triangle
        vertices = [
            [x, y + size * 0.577],  # top vertex
            [x - size * 0.5, y - size * 0.289],  # bottom left
            [x + size * 0.5, y - size * 0.289]   # bottom right
        ]
        shape = Polygon(*[np.array(v) for v in vertices], color=color, fill_opacity=fill_opacity, stroke_width=stroke_width)
    elif shape_type == "rectangle":
        width = (shape_data.width or size) * scale_factor
        height = (shape_data.height or size) * scale_factor
        shape = Rectangle(width=width, height=height, color=color, fill_opacity=fill_opacity, stroke_width=stroke_width)
    elif shape_type == "polygon":
        if shape_data.vertices:
            # Scale down custom vertices
            vertices = [np.array([v[0] * 0.3, v[1] * 0.3, 0]) for v in shape_data.vertices]
            shape = Polygon(*vertices, color=color, fill_opacity=fill_opacity, stroke_width=stroke_width)
        else:
            # Default to hexagon if no vertices provided
            angles = np.linspace(0, 2*np.pi, 6, endpoint=False)
            vertices = [[x + size * np.cos(a), y + size * np.sin(a)] for a in angles]
            shape = Polygon(*[np.array(v) for v in vertices], color=color, fill_opacity=fill_opacity, stroke_width=stroke_width)
    elif shape_type == "line":
        # Create a horizontal line
        start = np.array([x - size/2, y, 0])
        end = np.array([x + size/2, y, 0])
        shape = Line(start, end, color=color, stroke_width=stroke_width)
    elif shape_type == "arrow":
        # Create a horizontal arrow
        start = np.array([x - size/2, y, 0])
        end = np.array([x + size/2, y, 0])
        shape = Arrow(start, end, color=color, stroke_width=stroke_width)
    else:
        # Default to circle for unknown shapes
        shape = Circle(radius=size, color=color, fill_opacity=fill_opacity, stroke_width=stroke_width)
    
    # Position the shape
    shape.move_to(np.array([x, y, 0]))
    return shape

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

        self.play(FadeOut(title, lines))
        self.wait(0.5)  # A brief pause for transition

        # Optional graph (DROP-IN REPLACEMENT)
        if lesson.function_plots:
            PLOT_COLORS = [BLUE, GREEN]  # Colors for the 1st and 2nd plot
            x = sp.symbols("x")

            def _nice_step(span, target_ticks=6):
                # ... (this helper function is unchanged)
                span = float(abs(span))
                if span == 0 or not np.isfinite(span): return 1.0
                raw = span / max(target_ticks, 1)
                exp = np.floor(np.log10(raw))
                base = raw / (10 ** exp)
                if base < 1.5:
                    nice = 1.0
                elif base < 3.5:
                    nice = 2.0
                elif base < 7.5:
                    nice = 5.0
                else:
                    nice = 10.0
                return nice * (10 ** exp)

            try:
                # --- Step 1: Parse all functions and gather their data ---
                parsed_plots = []
                for i, plot_data in enumerate(lesson.function_plots):
                    if i >= len(PLOT_COLORS): break  # Max 2 plots
                    expr = to_sympy_expr(plot_data.expression)
                    func = sp.lambdify(x, expr, modules=["numpy"])
                    parsed_plots.append({
                        "func": func,
                        "label_tex": plot_data.label,
                        "color": PLOT_COLORS[i]
                    })

                if not parsed_plots:
                    raise ValueError("No valid functions to plot.")

                # --- Step 2: Sample all functions to find global y-bounds ---
                xs = np.linspace(lesson.x_min, lesson.x_max, 400)
                all_ys = []
                for plot in parsed_plots:
                    ys = np.array(plot["func"](xs), dtype=float)
                    plot["ys_sampled"] = ys  # Store for later use
                    all_ys.append(ys[np.isfinite(ys)])

                valid_ys = np.concatenate(all_ys)
                if valid_ys.size == 0:
                    ymin, ymax = -1.0, 1.0
                else:
                    ymin, ymax = float(np.min(valid_ys)), float(np.max(valid_ys))
                    if ymin == ymax: ymin -= 1.0; ymax += 1.0

                pad = max(0.10 * (ymax - ymin), 0.5)
                ymin -= pad;
                ymax += pad

                # --- Step 3: Create axes based on global bounds ---
                x_step = _nice_step(lesson.x_max - lesson.x_min, target_ticks=8)
                y_step = _nice_step(ymax - ymin, target_ticks=6)

                axes = Axes(
                    x_range=[lesson.x_min, lesson.x_max, x_step],
                    y_range=[ymin, ymax, y_step],
                    x_length=8, y_length=4.5, tips=False,
                    axis_config={"include_numbers": True, "font_size": 24},
                ).center()

                self.play(Create(axes), run_time=0.8)

                # --- Step 4: Plot each function sequentially ---
                labels_group = VGroup()
                for plot in parsed_plots:
                    def f_scalar(t, func=plot["func"]):  # Capture func in closure
                        try:
                            val = func(float(t))
                            return float(val) if np.isfinite(val) else np.nan
                        except Exception:
                            return np.nan

                    graph = axes.plot(
                        f_scalar, x_range=[lesson.x_min, lesson.x_max],
                        stroke_width=4, color=plot["color"]
                    )

                    label = MathTex(plot["label_tex"], font_size=32, color=plot["color"])
                    labels_group.add(label)

                    self.play(Create(graph), Write(label), run_time=1.2)
                    self.wait(0.2)

                # Arrange labels nicely
                labels_group.arrange(RIGHT, buff=0.4).next_to(axes, UP, buff=0.3)
                self.play(labels_group.animate)
                self.wait(0.5)

            except Exception as e:
                err = Text(f"Parse/plot error: {e}", font_size=24, color=RED).to_edge(DOWN).shift(UP * 0.5)
                self.play(FadeIn(err))
                self.wait(0.5)

        # Optional geometric shapes
        if lesson.geometric_shapes:
            try:
                shapes_group = VGroup()
                labels_group = VGroup()
                
                for shape_data in lesson.geometric_shapes:
                    # Create the geometric shape
                    shape = create_geometric_shape(shape_data)
                    shapes_group.add(shape)
                    
                    # Create label for the shape
                    label = MathTex(shape_data.label, font_size=24, color=shape.color)
                    # Position label near the shape
                    label.next_to(shape, UP, buff=0.2)
                    labels_group.add(label)
                
                # Animate shapes appearing one by one
                for i, (shape, label) in enumerate(zip(shapes_group, labels_group)):
                    self.play(Create(shape), Write(label), run_time=0.8)
                    self.wait(0.2)
                
                # Arrange all shapes nicely if there are multiple
                if len(shapes_group) > 1:
                    # Scale down the arrangement to fit better
                    shapes_group.arrange(RIGHT, buff=0.4)
                    labels_group.arrange(RIGHT, buff=0.4)
                    # Center the group and scale it down if needed
                    shapes_group.center()
                    labels_group.next_to(shapes_group, UP, buff=0.15)
                    
                    # Scale down if the group is too wide (more aggressive scaling)
                    if shapes_group.width > 6:
                        scale_factor = 6 / shapes_group.width
                        shapes_group.scale(scale_factor)
                        labels_group.scale(scale_factor)
                        labels_group.next_to(shapes_group, UP, buff=0.15)
                    
                    self.play(
                        shapes_group.animate,
                        labels_group.animate
                    )
                
                self.wait(1.0)
                
            except Exception as e:
                err = Text(f"Geometric shape error: {e}", font_size=24, color=RED).to_edge(DOWN).shift(UP * 0.5)
                self.play(FadeIn(err))
                self.wait(0.5)

        self.wait(0.5)
