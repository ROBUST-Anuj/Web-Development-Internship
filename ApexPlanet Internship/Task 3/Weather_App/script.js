async function getWeather() {
  const city = document.getElementById("cityInput").value;
  const apiKey = "9567b70c13e2e1f290dd0a727703ca11"; 
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();

    document.getElementById("cityName").textContent = data.name;
    document.getElementById("temp").textContent = `🌡️ Temperature: ${data.main.temp} °C`;
    document.getElementById("desc").textContent = `☁️ Weather: ${data.weather[0].description}`;
    document.getElementById("weatherResult").classList.remove("hidden");
  } catch (error) {
    alert("Error: " + error.message);
  }
}
