import streamlit as st
import torch
from torchvision import transforms
from torchvision.models import resnet18, ResNet18_Weights
from PIL import Image

# Load model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

weights = ResNet18_Weights.DEFAULT
model = resnet18(weights=weights)
num_features = model.fc.in_features
model.fc = torch.nn.Linear(num_features, 2)
model.load_state_dict(torch.load("flood_classifier.pth", map_location=device))
model = model.to(device)
model.eval()

# Preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# UI
st.set_page_config(page_title="Flood Detection AI", page_icon="🌊", layout="centered")
st.title("🌊 Flood Detection Classifier")
st.write("Upload an image and let the AI tell you if the area is **Flooded** or **Not Flooded**.")

uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    image = Image.open(uploaded_file).convert("RGB")
    st.image(image, caption="Uploaded Image", use_container_width=True)

    # Prediction
    img_tensor = transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        outputs = model(img_tensor)
        probs = torch.nn.functional.softmax(outputs, dim=1)
        confidence, preds = torch.max(probs, 1)
        label = "🌊 Flooded" if preds.item() == 0 else "🌤️ Not Flooded"

    st.markdown(f"### Prediction: {label}")
    st.markdown(f"**Confidence:** {confidence.item()*100:.2f}%")
