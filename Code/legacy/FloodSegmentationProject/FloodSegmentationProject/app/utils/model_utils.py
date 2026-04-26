import torch
from torchvision import transforms
from PIL import Image
import os

# Load model once when server starts
MODEL_PATH = os.getenv("MODEL_PATH", "flood_classifier.pth")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model():
    model = torch.load(MODEL_PATH, map_location=device)
    model.eval()
    return model

model = load_model()

# Define image preprocessing (same as training)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def predict_image(image_path: str):
    """Run inference on one image and return prediction."""
    img = Image.open(image_path).convert("RGB")
    tensor = transform(img).unsqueeze(0).to(device)
    with torch.no_grad():
        outputs = model(tensor)
        _, predicted = torch.max(outputs, 1)
    label = "Flooded" if predicted.item() == 1 else "Non-Flooded"
    return label
