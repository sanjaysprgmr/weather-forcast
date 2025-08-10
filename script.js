let isCelsius = true;
let currentTempC = 0;

function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) return alert("Please enter a city!");

  fetch(`/api/weather?city=${city}`)
    .then((res) => res.json())
    .then((data) => updateUI(data))
    .catch(() => alert("City not found or API error."));
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      fetch(`/api/weather?lat=${latitude}&lon=${longitude}`)
        .then((res) => res.json())
        .then((data) => updateUI(data))
        .catch(() => alert("Failed to fetch weather."));
    });
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

function updateUI(data) {
  if (!data || !data.weather) return;

  document.getElementById("weatherContainer").classList.remove("d-none");
  document.getElementById("location").innerText = `${data.name}, ${data.sys.country}`;
  document.getElementById("description").innerText = data.weather[0].description;
  document.getElementById("icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  currentTempC = data.main.temp;
  updateTemp();
  updateTime(data.timezone);

  const alertBox = document.getElementById("alerts");
  if (data.alerts && data.alerts.length) {
    alertBox.classList.remove("d-none");
    alertBox.innerText = data.alerts[0].description;
  } else {
    alertBox.classList.add("d-none");
  }

  updateBackground(data.weather[0].main);
  updateForecast(data.forecast);
}

function updateTemp() {
  const temp = isCelsius ? currentTempC : (currentTempC * 9) / 5 + 32;
  document.getElementById("temperature").innerText = `${temp.toFixed(1)}°`;
  document.getElementById("unit").innerText = isCelsius ? "C" : "F";
}

function toggleUnit() {
  isCelsius = !isCelsius;
  updateTemp();
}

function updateTime(timezoneOffset) {
  const localTime = new Date(Date.now() + timezoneOffset * 1000).toUTCString();
  document.getElementById("localTime").innerText = `Local time: ${localTime}`;
}

function updateBackground(condition) {
  const body = document.body;
  body.className = ""; // reset
  const cond = condition.toLowerCase();
  if (cond.includes("rain")) body.classList.add("rain");
  else if (cond.includes("cloud")) body.classList.add("clouds");
  else if (cond.includes("clear") || cond.includes("sun")) body.classList.add("sunny");
  else body.classList.add("clear");
}

function updateForecast(forecast) {
  const forecastDiv = document.getElementById("forecastCards");
  forecastDiv.innerHTML = "";
  document.getElementById("forecast").classList.remove("d-none");

  forecast.forEach((f) => {
    const card = document.createElement("div");
    card.className = "card m-2 p-2";
    card.innerHTML = `
      <h5>${f.date}</h5>
      <img src="https://openweathermap.org/img/wn/${f.icon}@2x.png" />
      <p>${f.temp}°C</p>
      <small>${f.desc}</small>
    `;
    forecastDiv.appendChild(card);
  });
}
