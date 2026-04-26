import requests

API_KEY = "7ab067b28bb4b094398b9a8cfea9760c"

def get_weather_data(city):
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    response = requests.get(url, timeout=10)
    data = response.json()

    if data.get("cod") != 200:
        return None

    main = data["main"]
    wind = data["wind"]
    clouds = data["clouds"]

    weather_info = {
        "temperature": main["temp"],
        "humidity": main["humidity"],
        "pressure": main["pressure"],
        "windspeed": wind.get("speed", 0),
        "clouds": clouds.get("all", 0),
        "rainfall": data.get("rain", {}).get("1h", 0),  # rainfall in mm (if available)
    }

    return weather_info