# model/train_model.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib


# Load dataset (Excel version)
df = pd.read_csv("data/flood_dataset.csv")


# Clean column names (sometimes Excel adds weird symbols)
df.columns = df.columns.str.strip()

# Encode categorical columns
for col in ["Land Cover", "Soil Type"]:
    if col in df.columns:
        df[col] = LabelEncoder().fit_transform(df[col])

# Select features (make sure they match your columns)
features = [
    "Rainfall (mm)", "Temperature (°C)", "Humidity (%)",
    "River Discharge (m³/s)", "Water Level (m)", "Elevation (m)",
    "Infrastructure", "Historical Floods", "Land Cover", "Soil Type"
]
target = "Flood Occurred"

X = df[features]
y = df[target]

# Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier(n_estimators=300, max_depth=12, random_state=42)
model.fit(X_train, y_train)

# Save the model
joblib.dump(model, "model/flood_model.pkl")

print("✅ Flood prediction model trained and saved successfully!")

