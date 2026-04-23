import os
import base64
import io
import pickle
import requests
import torch
from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_cors import CORS
from torchvision import transforms
from torchvision.models import resnet18, ResNet18_Weights
from PIL import Image
from training import prediction

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Ensure all relative paths work regardless of where the process is started from.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def p(*parts: str) -> str:
    return os.path.join(BASE_DIR, *parts)

data = [{'name':'Delhi', "sel": "selected"}, {'name':'Mumbai', "sel": ""}, {'name':'Kolkata', "sel": ""}, {'name':'Bangalore', "sel": ""}, {'name':'Chennai', "sel": ""}]
# data = [{'name':'India', "sel": ""}]
months = [{"name":"May", "sel": ""}, {"name":"June", "sel": ""}, {"name":"July", "sel": "selected"}]
cities = [{'name':'Delhi', "sel": "selected"}, {'name':'Mumbai', "sel": ""}, {'name':'Kolkata', "sel": ""}, {'name':'Bangalore', "sel": ""}, {'name':'Chennai', "sel": ""}, {'name':'New York', "sel": ""}, {'name':'Los Angeles', "sel": ""}, {'name':'London', "sel": ""}, {'name':'Paris', "sel": ""}, {'name':'Sydney', "sel": ""}, {'name':'Beijing', "sel": ""}]

# model = pickle.load(open("model.pickle", 'rb')) # Legacy model
model = pickle.load(open(p("models", "flood_model.pkl"), "rb"))  # Model from PredictionProject

# Load Flood Classification Model (ResNet18)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# Avoid hanging on first-run weight downloads (common on restricted networks).
# If pretrained weights are already cached, we'll use them; otherwise fall back to None.
try:
    weights = ResNet18_Weights.DEFAULT
    classifier_model = resnet18(weights=weights)
except Exception:
    classifier_model = resnet18(weights=None)
num_features = classifier_model.fc.in_features
classifier_model.fc = torch.nn.Linear(num_features, 2)
classifier_model.load_state_dict(
    torch.load(p("models", "flood_classifier.pth"), map_location=device)
)
classifier_model = classifier_model.to(device)
classifier_model.eval()

# Preprocessing for Classification
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

def _classify_pil_image(image: Image.Image):
    img_tensor = transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        outputs = classifier_model(img_tensor)
        probs = torch.nn.functional.softmax(outputs, dim=1)
        confidence, preds = torch.max(probs, 1)
        label = "Flooded" if preds.item() == 0 else "Not Flooded"
        conf_score = round(confidence.item() * 100, 2)
    return label, conf_score

@app.get("/api/health")
def api_health():
    return jsonify({"ok": True})

@app.get("/api/flood-risk")
def api_flood_risk():
    """
    JSON version of predicts.html logic.
    Query params:
      - city: string
    """
    cityname = request.args.get("city", "").strip()
    if not cityname:
        return jsonify({"ok": False, "error": "Missing ?city="}), 400

    try:
        latitude = None
        longitude = None

        # Primary: HERE geocoding (may be rate-limited / key may be invalid)
        try:
            URL = "https://geocode.search.hereapi.com/v1/geocode"
            api_key = 'pPFSt0miNxLZJY6_Zs-h-nB9W1XxxJG6s3wat1L37r8'
            r = requests.get(url=URL, params={"apikey": api_key, "q": cityname}, timeout=12)
            data = r.json()
            if isinstance(data, dict) and data.get("items"):
                latitude = data["items"][0]["position"]["lat"]
                longitude = data["items"][0]["position"]["lng"]
        except Exception:
            pass

        # Fallback: OpenStreetMap Nominatim (no API key)
        if latitude is None or longitude is None:
            r = requests.get(
                "https://nominatim.openstreetmap.org/search",
                params={"format": "json", "q": cityname, "limit": 1},
                headers={"User-Agent": "DisasterPredict/1.0 (local dev)"},
                timeout=12,
            )
            arr = r.json()
            if not arr:
                raise RuntimeError("Geocoding failed")
            latitude = float(arr[0]["lat"])
            longitude = float(arr[0]["lon"])

        final = prediction.get_data(latitude, longitude)
        final[4] *= 15

        # Some deployments have a non-model artifact in flood_model.pkl.
        # If we don't have a sklearn-like model, fall back to a simple heuristic score.
        risk_score = None
        pred = None

        if hasattr(model, "predict"):
            pred_raw = str(model.predict([final])[0])
            pred = "Safe" if pred_raw == "0" else "Unsafe"
        else:
            avg_temp, max_temp, wspd, cloud, precip, humidity = final
            score = 0.0
            score += min(1.0, precip / 120.0) * 0.55
            score += min(1.0, humidity / 100.0) * 0.20
            score += min(1.0, cloud / 100.0) * 0.15
            score += min(1.0, wspd / 35.0) * 0.10
            risk_score = round(score, 3)
            pred = "Unsafe" if risk_score >= 0.55 else "Safe"

        return jsonify({
            "ok": True,
            "city": cityname,
            "lat": latitude,
            "lon": longitude,
            "features": {
                "avg_temp": round(final[0], 2),
                "max_temp": round(final[1], 2),
                "avg_wind_speed": round(final[2], 2),
                "avg_cloud_cover": round(final[3], 2),
                "total_precip": round(final[4], 2),
                "avg_humidity": round(final[5], 2)
            },
            "risk_score": risk_score,
            "prediction": pred
        })
    except Exception as e:
        return jsonify({"ok": False, "error": "Unable to retrieve prediction", "details": str(e)}), 500

@app.post("/api/classify-image")
def api_classify_image():
    """
    JSON version of /classify.
    Form-data:
      - file: image
    """
    if "file" not in request.files:
        return jsonify({"ok": False, "error": "Missing form-data file"}), 400

    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({"ok": False, "error": "Empty file"}), 400

    try:
        image = Image.open(file).convert("RGB")
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        label, conf_score = _classify_pil_image(image)
        return jsonify({
            "ok": True,
            "prediction": label,
            "confidence": conf_score,
            "image_base64_png": img_str
        })
    except Exception as e:
        return jsonify({"ok": False, "error": "Unable to classify image", "details": str(e)}), 500

@app.route("/")
@app.route('/index.html')
def index() -> str:
    """Base page."""
    return render_template("index.html")

@app.route('/plots.html')
def plots():
    return render_template('plots.html')

@app.route('/heatmaps.html')
def heatmaps():
    return render_template('heatmaps.html')

@app.route('/chart.html')
def chart():
    return render_template('chart.html')

@app.route('/satellite.html')
def satellite():
    direc = p("satellite_images", "Delhi_July.png")
    with open(direc, "rb") as image_file:
        image = base64.b64encode(image_file.read())
    image = image.decode('utf-8')
    return render_template('satellite.html', data=data, image_file=image, months=months, text="Delhi in January 2024")

@app.route('/satellite.html', methods=['GET', 'POST'])
def satelliteimages():
    place = request.form.get('place')
    date = request.form.get('date')
    data = [{'name':'Delhi', "sel": ""}, {'name':'Mumbai', "sel": ""}, {'name':'Kolkata', "sel": ""}, {'name':'Bangalore', "sel": ""}, {'name':'Chennai', "sel": ""}]
    months = [{"name":"May", "sel": ""}, {"name":"June", "sel": ""}, {"name":"July", "sel": ""}]
    for item in data:
        if item["name"] == place:
            item["sel"] = "selected"
    
    for item in months:
        if item["name"] == date:
            item["sel"] = "selected"

    text = place + " in " + date + " 2024"

    direc = p("satellite_images", "{}_{}.png".format(place, date))
    with open(direc, "rb") as image_file:
        image = base64.b64encode(image_file.read())
    image = image.decode('utf-8')
    return render_template('satellite.html', data=data, image_file=image, months=months, text=text)

@app.route('/predicts.html')
def predicts():
    return render_template('predicts.html', cities=cities, cityname="Information about the city")

@app.route('/predicts.html', methods=["GET", "POST"])
def get_predicts():
    try:
        cityname = request.form["city"]
        cities = [{'name':'Delhi', "sel": ""}, {'name':'Mumbai', "sel": ""}, {'name':'Kolkata', "sel": ""}, {'name':'Bangalore', "sel": ""}, {'name':'Chennai', "sel": ""}, {'name':'New York', "sel": ""}, {'name':'Los Angeles', "sel": ""}, {'name':'London', "sel": ""}, {'name':'Paris', "sel": ""}, {'name':'Sydney', "sel": ""}, {'name':'Beijing', "sel": ""}]
        for item in cities:
            if item['name'] == cityname:
                item['sel'] = 'selected'
        print(cityname)
        URL = "https://geocode.search.hereapi.com/v1/geocode"
        location = cityname
        #api_key = 'LHtLOXHyYWrAYEFNbXIQg8BM6PEY8Jryp88mmHYvAGw' # Acquire from developer.here.com
        api_key = 'pPFSt0miNxLZJY6_Zs-h-nB9W1XxxJG6s3wat1L37r8' # Acquire from developer.here.com

        PARAMS = {'apikey':api_key,'q':location} 
        # sending get request and saving the response as response object 
        r = requests.get(url = URL, params = PARAMS) 
        print(r)
        data = r.json()
        latitude = data['items'][0]['position']['lat']
        longitude = data['items'][0]['position']['lng']
        print(f"Latitude: {latitude}, Longitude: {longitude}")
        final = prediction.get_data(latitude, longitude)
        
        final[4] *= 15
        if str(model.predict([final])[0]) == "0":
            pred = "Safe"
        else:
            pred = "Unsafe"
        
        return render_template('predicts.html', cityname="Information about " + cityname, cities=cities, temp=round(final[0], 2), maxt=round(final[1], 2), wspd=round(final[2], 2), cloudcover=round(final[3], 2), percip=round(final[4], 2), humidity=round(final[5], 2), pred = pred)
    except:
        return render_template('predicts.html', cities=cities, cityname="Oops, we weren't able to retrieve data for that city.")

@app.route('/classification.html')
def classification():
    return render_template('classification.html')

@app.route('/classify', methods=['POST'])
def classify_image():
    if 'file' not in request.files:
        return redirect(request.url)
    
    file = request.files['file']
    if file.filename == '':
        return redirect(request.url)

    if file:
        image = Image.open(file).convert("RGB")
        
        # Prepare for display
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

        label, conf_score = _classify_pil_image(image)

        return render_template('classification.html', 
                               image_file=img_str, 
                               prediction=label, 
                               confidence=conf_score)

if __name__ == "__main__":
    app.run(debug=True)