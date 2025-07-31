// OpenWeatherMap API configuration
const API_KEY = 'd81422884d99bcb289f280989beaecb7'; // Got this from openweathermap.org
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Demo mode for testing without API key
const DEMO_MODE = false;

// Function to generate realistic weather data for any city
function generateMockWeatherData(cityName) {
    const countries = ['US', 'GB', 'FR', 'DE', 'JP', 'AU', 'CA', 'IT', 'ES', 'BR', 'IN', 'CN', 'RU', 'MX', 'AR'];
    const weatherConditions = [
        'clear sky', 'few clouds', 'scattered clouds', 'broken clouds', 'overcast clouds',
        'light rain', 'moderate rain', 'heavy rain', 'sunny', 'partly cloudy',
        'mostly cloudy', 'light snow', 'fog', 'mist', 'thunderstorm'
    ];
    
    // Generate semi-realistic data based on city name hash
    const cityHash = cityName.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    
    const baseTemp = 15 + (Math.abs(cityHash) % 25); // Temperature between 15-40°C
    const humidity = 40 + (Math.abs(cityHash * 2) % 50); // Humidity 40-90%
    const windSpeed = 1 + (Math.abs(cityHash * 3) % 8); // Wind 1-9 m/s
    const pressure = 1000 + (Math.abs(cityHash * 4) % 30); // Pressure 1000-1030 hPa
    const visibility = 5000 + (Math.abs(cityHash * 5) % 15000); // Visibility 5-20km
    
    return {
        "name": cityName,
        "sys": {"country": countries[Math.abs(cityHash) % countries.length]},
        "main": {
            "temp": baseTemp,
            "feels_like": baseTemp + (Math.abs(cityHash * 6) % 6) - 3,
            "humidity": humidity,
            "pressure": pressure
        },
        "weather": [{"description": weatherConditions[Math.abs(cityHash * 7) % weatherConditions.length]}],
        "wind": {"speed": windSpeed},
        "visibility": visibility
    };
}

function generateMockForecastData(cityName) {
    const baseTemp = 15 + (Math.abs(cityName.charCodeAt(0)) % 25);
    const weatherConditions = ['sunny', 'cloudy', 'rainy', 'partly cloudy', 'overcast'];
    
    return {
        "list": Array.from({length: 5}, (_, i) => ({
            "dt": Math.floor(Date.now()/1000) + (i * 86400),
            "main": {"temp": baseTemp + (Math.random() * 10) - 5},
            "weather": [{"description": weatherConditions[i % weatherConditions.length]}]
        }))
    };
}

// Additional popular cities for quick access
const popularCities = ['London', 'New York', 'Tokyo', 'Paris', 'Dubai', 'Sydney', 'Mumbai', 'Berlin', 'Cairo', 'Mexico City'];

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
        if (DEMO_MODE) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Generate weather data for any city
            const weatherData = generateMockWeatherData(city);
            const forecastData = generateMockForecastData(city);
            
            displayWeather(weatherData);
            displayForecast(forecastData);
        } else {
            // Real API calls (when you have an API key)
            const weatherResponse = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
            const forecastResponse = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`);

            if (!weatherResponse.ok || !forecastResponse.ok) {
                throw new Error('City not found');
            }

            const weatherData = await weatherResponse.json();
            const forecastData = await forecastResponse.json();

            displayWeather(weatherData);
            displayForecast(forecastData);
        }
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
            
            if (DEMO_MODE) {
                // In demo mode, generate data for "Your Location"
                await new Promise(resolve => setTimeout(resolve, 1000));
                const locationWeather = generateMockWeatherData("Your Location");
                const locationForecast = generateMockForecastData("Your Location");
                displayWeather(locationWeather);
                displayForecast(locationForecast);
            } else {
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