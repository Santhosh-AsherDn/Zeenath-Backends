import express from "express";
import axios from "axios";

const router = express.Router();

const API_KEY = process.env.OPENWEATHER_API_KEY;

router.get("/yelagiri", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: "Missing OpenWeatherMap API key" });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=Yelagiri&units=metric&appid=${API_KEY}`;
    const response = await axios.get(url);
    const temperature = Math.round(response.data.main.temp);
    res.json({ temperature });
  } catch (error) {
    console.error("Weather API Error:", error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

export default router;
