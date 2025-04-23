from fastapi import APIRouter, UploadFile, File, Form

router = APIRouter()


@router.post('/classification/train')
async def train_new_classifier(
    file: UploadFile = File(...),
    dataset_id: str = Form(...),
):
    pass
