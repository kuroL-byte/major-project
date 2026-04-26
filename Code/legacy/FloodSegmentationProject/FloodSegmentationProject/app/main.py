from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.predict import router as predict_router

app = FastAPI(title="Flood Segmentation API", version="1.0")

# Allow frontend access (React, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add router
app.include_router(predict_router)

@app.get("/")
def root():
    return {"message": "Flood Segmentation API is running!"}
