from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
from utils.weather_api import get_weather_data

app = Flask(__name__)
CORS(app)


try:
    model = joblib.load("model/flood_model.pkl")
    print("✅ Model loaded successfully.")
except Exception as e:
    print(f"❌ Failed to load model: {e}")
    model = None



@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "🌦️ India Climate & Flood Prediction API is live!",
        "usage": "POST /predict { 'city': 'Mumbai' }"
    })


# ----------------------------
# 🔮 ROUTE: PREDICTION
# ----------------------------
@app.route("/predict", methods=["POST"])
def predict_flood():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    data = request.get_json()
    city = data.get("city")

    if not city:
        return jsonify({"error": "City name required"}), 400

    weather = get_weather_data(city)
    if not weather:
        return jsonify({"error": "Could not fetch weather data"}), 500

    features = [[
        weather["rainfall"], weather["temperature"], weather["humidity"],
        weather["windspeed"], 5, 50, 1, 0, 1, 1
    ]]

    pred = model.predict(features)[0]
    prob = model.predict_proba(features)[0][1]

    response = {
        "city": city.title(),
        "prediction": int(pred),
        "probability": round(float(prob), 4),
        "risk_label": "High" if pred == 1 else "Low",
        "weather": weather,
        "advice": (
            "⚠️ High Flood Risk! Stay alert and avoid low-lying areas."
            if pred == 1
            else "✅ Low Flood Risk. Conditions seem normal, stay updated."
        )
    }

    return jsonify(response), 200


# ----------------------------
# 🚀 RUN SERVER
# ----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
