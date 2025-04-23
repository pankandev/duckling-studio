from pydantic import BaseModel
from typing_extensions import TypeVar, Generic

T = TypeVar("T", bound=BaseModel)

class SingleItemResponse(BaseModel, Generic[T]):
    item: T


class ListItemResponse(BaseModel, Generic[T]):
    items: list[T]
