# lesson_schema.py
from pydantic import BaseModel, Field
from typing import List, Optional

# --- NEW: A model for a single function plot ---
class FunctionPlot(BaseModel):
    expression: str = Field(description="The mathematical expression to plot, e.g., 'x**2'.")
    label: str = Field(description="The LaTeX label for the function in the plot legend, e.g., 'f(x)'.")

class Lesson(BaseModel):
    title: str = Field(min_length=1)
    steps: List[str] = Field(min_items=1)

    # --- MODIFIED: Replaced function_tex with a list of plottable functions ---
    # function_tex: Optional[str] = None  <- This is replaced by the line below
    function_plots: Optional[List[FunctionPlot]] = None

    # x_min and x_max now apply to all plots on the graph
    x_min: float = -3.0
    x_max: float = 3.0