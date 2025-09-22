import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const WeatherDashboard = () => {
  const [city, setCity] = useState('');
  const [weatherCards, setWeatherCards] = useState([]);
  const [currentLocationWeather, setCurrentLocationWeather] = useState(null);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const API_KEY = '1b1025147cab66d0fc1c78fb04624148'; 
  // Fetch weather by coordinates for current location
  const fetchCurrentLocationWeather = (lat, lon) => {
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      )
      .then((res) => {
        setCurrentLocationWeather(res.data);
      })
      .catch((err) => {
        console.error('Error fetching current location weather:', err);
        setError('Could not fetch your location’s weather.');
      });
  };

  const fetchDashboard = async () => {
    const token = localStorage.getItem("token");
  
    try {
      const res = await axios.get("http://localhost:5000/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      setUser(res.data.user); 
      console.log("Dashboard data", res.data);
  
    } catch (err) {
      console.error("Access denied", err);
      navigate("/login"); // Optional: redirect if token invalid
    }
  };
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          fetchCurrentLocationWeather(latitude, longitude);
        },
        () => {
          setError('Permission denied for location access.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return; // Stop here if no token
    }
  
    fetchDashboard();
  }, []);

  // Fetch weather by city name
  const fetchCityWeather = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );

      const alreadyExists =
        weatherCards.some((w) => w.name === res.data.name) ||
        currentLocationWeather?.name === res.data.name;

      if (!alreadyExists) {
        setWeatherCards((prev) => [...prev, res.data]);
        setError('');
      } else {
        setError('City is already shown.');
      }

      setCity('');
    } catch (err) {
      setError('City not found.');
    }
  };

  // Card component
  const WeatherCard = ({ weather }) => (
    <div className="bg-white p-5 rounded-2xl shadow-md text-center hover:scale-105 transition">
      <h2 className="text-lg font-semibold text-indigo-700">
        {weather.name}, {weather.sys?.country}
      </h2>
      <p className="text-4xl font-bold text-indigo-900 mt-2">{weather.main.temp}°C</p>
      <p className="capitalize text-gray-600">{weather.weather[0].description}</p>
      <div className="mt-3 text-sm text-gray-500">
        <p>Humidity: {weather.main.humidity}%</p>
        <p>Wind: {weather.wind.speed} m/s</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-4 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-indigo-800">🌤️ Weather Dashboard</h1>

        {/* Current Location Weather */}
        {currentLocationWeather && (
          <div>
            <h2 className="text-xl font-semibold text-indigo-600 mb-2 text-center">
              📍 Your Location Weather
            </h2>
            <WeatherCard weather={currentLocationWeather} />
          </div>
        )}

        {/* Form to Add City */}
        <form onSubmit={fetchCityWeather} className="flex flex-col sm:flex-row gap-4 mt-4">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Add City
          </button>
        </form>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Other Cities Weather Cards */}
        {weatherCards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-6">
            {weatherCards.map((weather, index) => (
              <WeatherCard key={index} weather={weather} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherDashboard;
