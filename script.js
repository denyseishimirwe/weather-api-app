// OpenWeatherMap API configuration
const API_KEY = 'd81422884d99bcb289f280989beaecb7';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('weather-display').style.display = 'none';
    document.getElementById('error').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    document.getElementById('error').textContent = message;
    document.getElementById('error').style.display = 'block';
    document.getElementById('weather-display').style.display = 'none';
    hideLoading();
}

function displayWeather(data) {
    document.getElementById('city-name').textContent = data.name + ', ' + data.sys.country;
    document.getElementById('temperature').textContent = Math.round(data.main.temp) + '°C';
    document.getElementById('description').textContent = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
    document.getElementById('feels-like').textContent = Math.round(data.main.feels_like) + '°C';
    document.getElementById('wind-speed').textContent = data.wind.speed + ' m/s';
    document.getElementById('humidity').textContent = data.main.humidity + '%';
    document.getElementById('visibility').textContent = (data.visibility / 1000).toFixed(1) + ' km';
    document.getElementById('pressure').textContent = data.main.pressure + ' hPa';

    hideLoading();
    document.getElementById('weather-display').style.display = 'block';
}

function displayForecast(data) {
    const forecastGrid = document.getElementById('forecast-grid');
    forecastGrid.innerHTML = '';

    data.list.forEach((forecast, index) => {
        if (index >= 5) return;
        
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-temp">${Math.round(forecast.main.temp)}°C</div>
            <div style="font-size: 0.9em; color: #636e72; margin-top: 5px;">
                ${forecast.weather[0].description}
            </div>
        `;
        forecastGrid.appendChild(forecastCard);
    });
}

async function fetchWeather(city) {
    showLoading();

    try {
        const weatherResponse = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const forecastResponse = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`);

        if (!weatherResponse.ok || !forecastResponse.ok) {
            throw new Error('City not found');
        }

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        displayWeather(weatherData);
        displayForecast(forecastData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError('Unable to fetch weather data. Please check the city name and try again.');
    }
}

function searchWeather() {
    const cityInput = document.querySelector('.search-input');
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    fetchWeather(city);
}

function searchCity(city) {
    fetchWeather(city);
}

function getCurrentLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by this browser');
        return;
    }

    showLoading();

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                const weatherResponse = await fetch(`${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
                const forecastResponse = await fetch(`${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);

                if (!weatherResponse.ok || !forecastResponse.ok) {
                    throw new Error('Unable to fetch weather for your location');
                }

                const weatherData = await weatherResponse.json();
                const forecastData = await forecastResponse.json();

                displayWeather(weatherData);
                displayForecast(forecastData);
            } catch (error) {
                console.error('Error fetching location weather:', error);
                showError('Unable to fetch weather for your location');
            }
        },
        (error) => {
            console.error('Geolocation error:', error);
            showError('Unable to get your location. Please search for a city manually.');
        }
    );
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchWeather();
        }
    });
    
    // Load London weather by default
    fetchWeather('London');
});