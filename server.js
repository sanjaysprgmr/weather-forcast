require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

const API_KEY = process.env.OPENWEATHER_KEY;

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/weather', async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    const baseUrl = 'https://api.openweathermap.org/data/2.5';
    const params = { appid: API_KEY, units: 'metric' };

    if (city) params.q = city;
    if (lat && lon) {
      params.lat = lat;
      params.lon = lon;
    }

    const [weatherRes, forecastRes] = await Promise.all([
      axios.get(`${baseUrl}/weather`, { params }),
      axios.get(`${baseUrl}/forecast`, { params })
    ]);

    const forecastData = forecastRes.data.list.filter((_, idx) => idx % 8 === 0).map((item) => ({
      date: new Date(item.dt * 1000).toDateString(),
      temp: item.main.temp,
      icon: item.weather[0].icon,
      desc: item.weather[0].main,
    }));

    const result = {
      ...weatherRes.data,
      forecast: forecastData,
    };

    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Could not fetch weather data.' });
  }
});

// Catch-all: redirect to frontend index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
