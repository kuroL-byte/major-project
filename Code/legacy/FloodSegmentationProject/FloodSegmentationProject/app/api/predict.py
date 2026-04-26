from fastapi import APIRouter, UploadFile, File
import os
from app.utils.model_utils import predict_image

router = APIRouter(prefix="/api/v1", tags=["Prediction"])

UPLOAD_FOLDER = "app/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Receive an image and return flood prediction."""
    # Save uploaded file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Run model prediction
    result = predict_image(file_path)
    return {"filename": file.filename, "prediction": result}
