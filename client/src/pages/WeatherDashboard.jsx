import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const WeatherDashboard = () => {
  const [city, setCity] = useState('');
  const [weatherCards, setWeatherCards] = useState([]);
  const [currentLocationWeather, setCurrentLocationWeather] = useState(null);
  const [currentLocationForecast, setCurrentLocationForecast] = useState([]);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("history")) || []);
  const navigate = useNavigate();

  const API_KEY = '1b1025147cab66d0fc1c78fb04624148';

  const getBackgroundImage = (weatherCondition) => {
    const condition = weatherCondition?.toLowerCase();
    if (condition?.includes('clear') || condition?.includes('sunny')) return 'https://images.unsplash.com/photo-1517441295968-38501e56b3e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTQzMjB8MHwxfHNlYXJjaHwzfHxzYW5keSUyMGJlYWNoJTIwZGF5fGVufDB8fHx8MTcwMDgzNDgyMnww&ixlib=rb-4.0.3&q=80&w=1080';
    if (condition?.includes('cloud') || condition?.includes('overcast')) return 'https://images.unsplash.com/photo-1507525428034-b723cf961dde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTQzMjB8MHwxfHNlYXJjaHwzfHxzZWFzaWRlJTIwY2xvdWR5JTIwd2VhdGhlcnxlbnwwfHx8fDE3MDA4MzQ0NTJ8MA&ixlib=rb-4.0.3&q=80&w=1080';
    if (condition?.includes('rain') || condition?.includes('drizzle')) return 'https://images.unsplash.com/photo-1534082723326-0e104e76d912?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTQzMjB8MHwxfHNlYXJjaHwyMHx8cmFpbiUyMG9jZWFufGVufDB8fHx8MTcwMDgzNDQ1M3ww&ixlib=rb-4.0.3&q=80&w=1080';
    if (condition?.includes('storm') || condition?.includes('thunder')) return 'https://images.unsplash.com/photo-1507663260840-7e5d8ac8545e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTQzMjB8MHwxfHNlYXJjaHwxNXx8dGh1bmRlcnN0b3JtJTIwb2NlYW58ZW58MHx8fHwxNzAwODM0NDUyfDA&ixlib=rb-4.0.3&q=80&w=1080';
    if (condition?.includes('snow')) return 'https://images.unsplash.com/photo-1549729598-c11ce4465492?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTQzMjB8MHwxfHNlYXJjaHwzfHxzbm93eSUyMGJlYWNofGVufDB8fHx8MTcwMDgzNDQ1Mnww&ixlib=rb-4.0.3&q=80&w=1080';
    if (condition?.includes('haze') || condition?.includes('mist') || condition?.includes('fog')) return 'https://images.unsplash.com/photo-1514751110006-2f0858169b2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTQzMjB8MHwxfHNlYXJjaHwxMHx8aGF6ZSUyMG9jZWFufGVufDB8fHx8MTcwMDgzNDQ1Mnww&ixlib=rb-4.0.3&q=80&w=1080';
    return 'https://images.unsplash.com/photo-1503389025263-e3801f5c7112?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTQzMjB8MHwxfHNlYXJjaHw1fHxvY2VhbiUyMHdlYXRoZXJ8ZW58MHx8fHwxNzAwODM0NDUzfDA&ixlib=rb-4.0.3&q=80&w=1080';
  };

  const fetchCurrentLocationWeather = async (lat, lon) => {
    try {
      const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
      setCurrentLocationWeather(res.data);
      const forecastRes = await axios.get(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${API_KEY}&units=metric`);
      setCurrentLocationForecast(forecastRes.data.daily.slice(0, 7));
    } catch (err) {
      setError('Could not fetch your location’s weather.');
    }
  };

  const fetchDashboard = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
    } catch (err) {
      // navigate("/login");
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchCurrentLocationWeather(pos.coords.latitude, pos.coords.longitude),
        () => setError('Permission denied for location access or location not found.')
      );
    } else setError('Geolocation is not supported by this browser.');
    const token = localStorage.getItem("token");
    if (!token) {
        // navigate("/login");
    }
    fetchDashboard();
  }, []);

  const fetchCityWeather = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    try {
      const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
      const forecastRes = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
      const dailyForecast = forecastRes.data.list.filter((reading) =>
        reading.dt_txt.includes("12:00:00")
      ).slice(0, 5);
      const newCard = { ...res.data, forecast: dailyForecast };
      const alreadyExists = weatherCards.some((w) => w.name === newCard.name) || currentLocationWeather?.name === newCard.name;
      if (alreadyExists) return setError('City is already shown.');
      setWeatherCards((prev) => [...prev, newCard]);
      setHistory((prev) => {
        const updated = [...new Set([newCard.name, ...prev])].slice(0, 5);
        localStorage.setItem("history", JSON.stringify(updated));
        return updated;
      });
      setCity('');
      setError('');
    } catch (err) {
      setError('City not found.');
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("history");
  };

  const getWeatherIcon = (iconCode) => `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  return (
    <div className="relative h-screen grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 font-sans overflow-hidden">
      {/* Left Section - Background Image & Main Weather Display (Fixed) */}
      <div
        className="relative col-span-1 min-h-[50vh] md:min-h-screen flex flex-col justify-between p-8 md:p-12 transition-all duration-500 bg-cover bg-center
        before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-400/20 before:to-blue-800/20 before:animate-wave-effect before:z-0"
        style={{ backgroundImage: `url(${getBackgroundImage(currentLocationWeather?.weather[0]?.main || 'clear')})` }}
      >
        <div className="absolute inset-0 bg-sky-900 bg-opacity-40 z-0"></div>

        {currentLocationWeather ? (
          <div className="relative z-10 flex flex-col h-full justify-between text-white">
            {/* Top Left: City Name & Country */}
            <div className="text-left">
              <p className="text-4xl md:text-5xl font-bold drop-shadow-lg leading-tight">{currentLocationWeather.name}</p>
              <p className="text-xl md:text-2xl font-light text-sky-100 mt-1">{currentLocationWeather.sys.country}</p>
            </div>

            {/* Current Location Details (Left Panel) */}
            <div className="text-left my-4 space-y-2">
              <div className="flex items-center space-x-4">
                <img src={getWeatherIcon(currentLocationWeather.weather[0].icon)} alt="Weather icon" className="w-20 h-20 drop-shadow-lg" />
                <p className="text-6xl md:text-8xl font-extrabold drop-shadow-lg">{Math.round(currentLocationWeather.main.temp)}<sup className="text-4xl align-super">°C</sup></p>
              </div>
              <p className="text-3xl font-light text-sky-200 capitalize">{currentLocationWeather.weather[0].description}</p>
              <div className="grid grid-cols-2 gap-x-4 text-sky-100">
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Humidity</span>
                  <span className="font-bold text-lg">{currentLocationWeather.main.humidity}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Wind Speed</span>
                  <span className="font-bold text-lg">{currentLocationWeather.wind.speed} m/s</span>
                </div>
              </div>
            </div>

            {/* Bottom Left: Time & Date */}
            <div className="text-left mb-4">
              <p className="text-3xl md:text-4xl font-light text-sky-200">
                {moment().format('HH:mm:ss')}
              </p>
              <p className="text-lg md:text-xl font-light text-sky-300">
                {moment().format('dddd, DD MMMM YYYY')}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex items-center justify-center h-full text-2xl font-semibold text-sky-200">
            {error || 'Loading current location weather...'}
          </div>
        )}
      </div>

      {/* Right Section - Search, Details & Forecast (Scrollable) */}
      <div className="md:col-span-1 lg:col-span-2 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 p-6 md:p-8 flex flex-col z-20 overflow-y-auto">
        <h2 className="text-4xl font-semibold text-center mb-6 text-indigo-700">Other Cities</h2>

        {/* Search Bar */}
        <form onSubmit={fetchCityWeather} className="flex items-center space-x-3 mb-6 bg-white rounded-full p-2 shadow-lg">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search any city"
            className="flex-grow bg-transparent text-lg px-2 text-gray-800 placeholder-gray-500 focus:outline-none"
          />
          <button type="submit" className="bg-indigo-500 text-white p-3 rounded-full hover:bg-indigo-600 transition duration-300 transform hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* City Cards (Searched Cities) */}
        {weatherCards.length > 0 && (
          <div className="space-y-6 mb-8">
            {weatherCards.map((weather, index) => (
              <div key={index} className="bg-white/90 p-5 rounded-xl shadow-md backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xl font-bold text-indigo-800">{weather.name}, {weather.sys.country}</h4>
                  <img src={getWeatherIcon(weather.weather[0].icon)} alt="Weather icon" className="w-16 h-16" />
                </div>
                <p className="text-3xl font-extrabold text-indigo-600">{Math.round(weather.main.temp)}°C</p>
                <p className="capitalize text-gray-500">{weather.weather[0].description}</p>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs text-center text-gray-700">
                  {weather.forecast.map((f, i) => (
                    <div key={i} className="bg-gray-100 p-2 rounded-lg">
                      <p className="font-medium">{moment(f.dt_txt).format('ddd')}</p>
                      <img src={getWeatherIcon(f.weather[0].icon)} alt="Forecast icon" className="w-10 h-10 mx-auto" />
                      <p className="font-bold text-indigo-700">{Math.round(f.main.temp)}°C</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-auto pt-6 border-t-2 border-gray-300">
            <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
              <span className="font-semibold">Recent searches:</span>
              <button onClick={clearHistory} className="text-red-500 hover:text-red-700 underline transition">Clear</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((h, i) => (
                <span key={i} className="bg-gray-300 px-3 py-1 rounded-full text-gray-700 text-sm font-medium">{h}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherDashboard;