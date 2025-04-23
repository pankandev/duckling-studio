from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class DatasetCreationRequest(BaseModel):
    display_name: str


@router.post('/datasets')
async def create_new_dataset(request: DatasetCreationRequest):
    pass

