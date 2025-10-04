# lesson_schema.py
from pydantic import BaseModel, Field
from typing import List, Optional

class Lesson(BaseModel):
    title: str = Field(min_length=1)
    steps: List[str] = Field(min_items=1)
    function_tex: Optional[str] = None
    x_min: float = -3.0
    x_max: float = 3.0
