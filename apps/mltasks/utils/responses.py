from pydantic import BaseModel
from typing_extensions import TypeVar

T = TypeVar("T")

class SingleItemResponse(BaseModel):
    item: T


class ListItemResponse(BaseModel):
    items: list[T]
