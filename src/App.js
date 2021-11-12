import { React, useState, useEffect } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { WEATHER_API_KEY } from "./Constants";
import axios from "axios";
import {
  FaLocationArrow,
  FaTemperatureLow,
  FaTemperatureHigh,
  FaCrosshairs,
} from "react-icons/fa";
import { getCountryByCode } from "./getCountryByCode";
import ReactCountryFlag from "react-country-flag";
import Geocode from "react-geocode";

Geocode.setApiKey(process.env.REACT_APP_LOCATION_API_KEY);

function App() {
  const [address, setAddress] = useState("");
  const [locationInfo, setLocationInfo] = useState("");
  const [countryData, setCountry] = useState("");
  const [error, setError] = useState(false);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [status, setStatus] = useState(null);

  const getWeather = () => {
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${address}&appid=${WEATHER_API_KEY}`;
    axios
      .get(weatherApiUrl)
      .then(function (response) {
        console.log(response.data);
        setCountry(getCountryByCode(response.data.sys.country));
        setLocationInfo(response.data);
      })
      .catch(function (error) {
        setError(true);
      });
  };

  const kelvinToFahrenheit = (k) => {
    return (k - 273.15).toFixed(2);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported by your browser");
    } else {
      setStatus("Locating...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setStatus(null);
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
        },
        () => {
          setStatus("Unable to retrieve your location");
        }
      );
    }
  };

  useEffect(() => {
    if (lat && lng) {
      getLocationLatLong(lat, lng);
    }
  }, [lat, lng]);

  useEffect(() => {
    if (address) {
      getWeather();
    }
  }, [address]);

  const getLocationLatLong = (lat, lang) => {
    Geocode.fromLatLng(lat, lang).then(
      (response) => {
        const address = response.results[0].formatted_address;
        let city, state, country;
        for (
          let i = 0;
          i < response.results[0].address_components.length;
          i++
        ) {
          for (
            let j = 0;
            j < response.results[0].address_components[i].types.length;
            j++
          ) {
            switch (response.results[0].address_components[i].types[j]) {
              case "locality":
                city = response.results[0].address_components[i].long_name;
                break;
              case "administrative_area_level_1":
                state = response.results[0].address_components[i].long_name;
                break;
              case "country":
                country = response.results[0].address_components[i].long_name;
                break;
            }
          }
        }
        setAddress(city);
      },
      (error) => {
        console.error(error);
      }
    );
  };

  return (
    <div className="App">
      <header className="App-header pt-5">
        <div className="container">
          <div className="wrapper pt-5">
            <div className="row">
              <div className="col-2"></div>
              <div className="col-8">
                <div className="input-group">
                  <FaCrosshairs
                    onClick={getLocation}
                    className="icon-location"
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Location..."
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-2"></div>
            </div>
            <br />
            {locationInfo ? (
              <div className="container">
                <div className="row">
                  <div className="col-sm-12 col-xs-12 col-md-12 col-lg-6 col-xl-6 pt-5">
                    <h1 className="teal-color big-text">
                      {kelvinToFahrenheit(locationInfo.main.temp)}&deg; C
                    </h1>
                    <br />
                    <ReactCountryFlag
                      countryCode={locationInfo.sys.country}
                      style={{
                        fontSize: "2em",
                        lineHeight: "3em",
                        marginBottom: "1em",
                      }}
                      svg
                    />
                    <h2>
                      <FaLocationArrow /> {locationInfo.name}
                    </h2>
                    <br />
                    <h5>{countryData.country}</h5>
                  </div>
                  <div className="col-sm-12 col-xs-12 col-md-12 col-lg-6 col-xl-6 pt-5">
                    <div className="weatherWrapper">
                      <img
                        src={`http://openweathermap.org/img/w/${locationInfo?.weather[0].icon}.png`}
                        alt="weather status icon"
                        className="weather-icon my-icon"
                      />
                      <h3>{locationInfo.weather[0].main}</h3>
                    </div>
                    <br />
                    <h3>
                      {kelvinToFahrenheit(locationInfo.main.temp_min)}&deg; C{" "}
                      <FaTemperatureLow />
                    </h3>
                    <h3>
                      {kelvinToFahrenheit(locationInfo.main.temp_max)}&deg; C{" "}
                      <FaTemperatureHigh />
                    </h3>
                  </div>
                  <div className="col-2"></div>
                </div>
              </div>
            ) : (
              <>
                {error ? (
                  <h3 className="teal-color">
                    Unable to find this location. Please try again...
                  </h3>
                ) : (
                  <h3 className="teal-color">Please search some location</h3>
                )}
              </>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
