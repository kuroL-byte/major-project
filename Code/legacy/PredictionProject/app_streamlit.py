from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
from utils.weather_api import get_weather_data

# ----------------------------
# ⚙️ FLASK APP CONFIG
# ----------------------------
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# ----------------------------
# 🧠 LOAD MODEL
# ----------------------------
try:
    model = joblib.load("model/flood_model.pkl")
    print("✅ Flood model loaded successfully.")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None


# ----------------------------
# 🌍 ROUTE: HOME
# ----------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "🌦️ India Climate & Flood Prediction API is running!",
        "usage": "Send a POST request to /predict with {'city': 'Mumbai'}"
    })


# ----------------------------
# 🔮 ROUTE: PREDICTION
# ----------------------------
@app.route("/predict", methods=["POST"])
def predict_flood():
    """
    Example input:
    {
        "city": "Kolkata"
    }
    """
    if model is None:
        return jsonify({"error": "Model not loaded."}), 500

    data = request.get_json()
    city = data.get("city")

    if not city:
        return jsonify({"error": "City name is required."}), 400

    try:
        weather = get_weather_data(city)
        if not weather:
            return jsonify({"error": "Could not fetch weather data."}), 500

        # Prepare input features for model
        features = [[
            weather["rainfall"], weather["temperature"], weather["humidity"],
            weather["windspeed"],  # Placeholder for River Discharge
            5,                     # Static Water level
            50,                    # Elevation estimate
            1,                     # Infrastructure index
            0,                     # Historical floods (default)
            1,                     # Land Cover encoded
            1                      # Soil Type encoded
        ]]

        # Make predictions
        pred = model.predict(features)[0]
        prob = model.predict_proba(features)[0][1]

        # Response payload
        response = {
            "city": city.title(),
            "prediction": int(pred),
            "probability": round(float(prob), 4),
            "risk_label": "High" if pred == 1 else "Low",
            "weather": {
                "temperature": weather["temperature"],
                "humidity": weather["humidity"],
                "windspeed": weather["windspeed"],
                "rainfall": weather["rainfall"],
                "clouds": weather["clouds"]
            },
            "advice": (
                "⚠️ High Flood Risk! Stay alert and avoid low-lying areas."
                if pred == 1
                else "✅ Low Flood Risk. Conditions seem normal, stay updated."
            )
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


# ----------------------------
# 🚀 RUN SERVER
# ----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
