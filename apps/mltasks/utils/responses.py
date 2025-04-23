from pydantic import BaseModel


class SingleItemResponse(BaseModel):
    item: BaseModel


class ListItemResponse(BaseModel):
    items: list[BaseModel]
