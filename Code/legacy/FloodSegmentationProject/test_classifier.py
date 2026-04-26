import torch
from torchvision import models, transforms
from torchvision.models import resnet18, ResNet18_Weights
from PIL import Image
import os

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model
weights = ResNet18_Weights.DEFAULT  # Use pretrained ImageNet weights
model = resnet18(weights=weights)
num_features = model.fc.in_features
model.fc = torch.nn.Linear(num_features, 2)
model.load_state_dict(torch.load("flood_classifier.pth", map_location=device))
model = model.to(device)
model.eval()

# Preprocess
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# Folder containing test images
test_folder = "data/test_images"

for img_name in os.listdir(test_folder):
    img_path = os.path.join(test_folder, img_name)
    image = Image.open(img_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image)
        _, preds = torch.max(outputs, 1)
        label = "Flooded 🌊" if preds.item() == 0 else "Not Flooded 🌤️"
        print(f"{img_name}: {label}")

