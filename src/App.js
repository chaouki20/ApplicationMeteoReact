import { Oval } from 'react-loader-spinner';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function Grp204WeatherApp() {
  const [input, setInput] = useState('');
  const [weather, setWeather] = useState({
    loading: false,
    data: {},
    dailyData: [],
    error: false,
  });

  // Fonction pour formater la date
  const formatDate = () => {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const weekdays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const currentDate = new Date();
    return `${weekdays[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;
  };

  // Détection automatique de la localisation
  const fetchWeatherByLocation = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const api_key = 'votre_cle_api';
      const url = 'https://api.openweathermap.org/data/2.5/weather';
      try {
        setWeather({ ...weather, loading: true });
        const response = await axios.get(url, {
          params: {
            lat: latitude,
            lon: longitude,
            units: 'metric',
            appid: api_key,
          },
        });
        setWeather({ data: response.data, loading: false, error: false });
      } catch (error) {
        console.error('Erreur lors de la détection de la localisation', error);
        setWeather({ ...weather, error: true });
      }
    });
  };

  // Recherche météo via le nom de la ville
  const fetchWeatherByCity = async (event) => {
    if (event.key === 'Enter') {
      setInput('');
      setWeather({ ...weather, loading: true });
      const url = 'https://api.openweathermap.org/data/2.5/forecast';
      const api_key = 'votre_cle_api';
      try {
        const response = await axios.get(url, {
          params: {
            q: input,
            units: 'metric',
            appid: api_key,
          },
        });

        const dailyData = response.data.list.filter((item, index) => index % 8 === 0);
        setWeather({ data: response.data, dailyData, loading: false, error: false });
      } catch (error) {
        setWeather({ ...weather, data: {}, error: true });
      }
    }
  };

  // Ajouter la ville aux favoris
  const addToFavorites = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(weather.data.name)) {
      favorites.push(weather.data.name);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  };

  // Charger les favoris
  const loadFavorites = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.map((city, index) => (
      <button key={index} onClick={() => handleFavoriteClick(city)}>
        {city}
      </button>
    ));
  };

  // Obtenir la météo depuis les favoris
  const handleFavoriteClick = async (city) => {
    setInput(city);
    fetchWeatherByCity({ key: 'Enter' });
  };

  // Mode jour/nuit
  const detectTheme = () => {
    const hours = new Date().getHours();
    return hours >= 18 || hours < 6 ? 'night-mode' : 'day-mode';
  };

  // Utilisation d'useEffect pour la détection automatique
  useEffect(() => {
    fetchWeatherByLocation();
  }, []);

  return (
    <div className={`App ${detectTheme()}`}>
      <h1 className="app-name">Application Météo grp204</h1>
      <div className="search-bar">
        <input
          type="text"
          className="city-search"
          placeholder="Entrez le nom de la ville..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyPress={fetchWeatherByCity}
        />
      </div>

      {weather.loading && <Oval type="Oval" color="black" height={100} width={100} />}

      {weather.error && (
        <span className="error-message">
          <FontAwesomeIcon icon={faFrown} />
          <span>Ville introuvable</span>
        </span>
      )}

      {weather.data && weather.data.main && (
        <div>
          <h2>{weather.data.name}, {weather.data.sys.country}</h2>
          <span>{formatDate()}</span>
          <img
            src={`https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`}
            alt={weather.data.weather[0].description}
          />
          <p>{Math.round(weather.data.main.temp)}°C</p>
          <p>Vitesse du vent : {weather.data.wind.speed} m/s</p>
          <button onClick={addToFavorites}>Ajouter aux favoris</button>
        </div>
      )}

      {weather.dailyData && (
        <div className="forecast">
          <h3>Prévisions pour les 5 prochains jours</h3>
          <div className="forecast-list">
            {weather.dailyData.map((day, index) => {
              const date = new Date(day.dt * 1000);
              return (
                <div key={index} className="forecast-card">
                  <h4>{date.toLocaleDateString()}</h4>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                    alt={day.weather[0].description}
                  />
                  <p>{Math.round(day.main.temp)}°C</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="favorites">{loadFavorites()}</div>
    </div>
  );
}

export default Grp204WeatherApp;
