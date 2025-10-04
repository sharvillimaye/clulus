# lesson_schema.py
from pydantic import BaseModel, Field
from typing import List, Optional, Literal

# --- NEW: A model for a single function plot ---
class FunctionPlot(BaseModel):
    expression: str = Field(description="The mathematical expression to plot, e.g., 'x**2'.")
    label: str = Field(description="The LaTeX label for the function in the plot legend, e.g., 'f(x)'.")

# --- NEW: A model for geometric shapes ---
class GeometricShape(BaseModel):
    shape_type: Literal["square", "circle", "triangle", "rectangle", "polygon", "line", "arrow"] = Field(
        description="The type of geometric shape to render"
    )
    label: str = Field(description="The LaTeX label for the shape, e.g., 'Square ABCD'.")
    position: List[float] = Field(description="Center position [x, y] for the shape", min_length=2, max_length=2)
    size: Optional[float] = Field(default=1.0, description="Size parameter (radius for circle, side length for square, etc.)")
    width: Optional[float] = Field(default=None, description="Width for rectangle (if different from size)")
    height: Optional[float] = Field(default=None, description="Height for rectangle (if different from size)")
    vertices: Optional[List[List[float]]] = Field(default=None, description="Custom vertices for polygon [[x1,y1], [x2,y2], ...]")
    color: Optional[str] = Field(default="BLUE", description="Color name for the shape")
    fill_opacity: Optional[float] = Field(default=0.3, description="Fill opacity (0-1)")
    stroke_width: Optional[float] = Field(default=2.0, description="Stroke width for the shape outline")

class Lesson(BaseModel):
    title: str = Field(min_length=1)
    steps: List[str] = Field(min_items=1)

    # --- MODIFIED: Replaced function_tex with a list of plottable functions ---
    # function_tex: Optional[str] = None  <- This is replaced by the line below
    function_plots: Optional[List[FunctionPlot]] = None

    # --- NEW: Support for geometric shapes ---
    geometric_shapes: Optional[List[GeometricShape]] = None

    # x_min and x_max now apply to all plots on the graph
    x_min: float = -3.0
    x_max: float = 3.0