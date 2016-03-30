let API_KEY = "ad695b2c2a3a0a72424a57e42adf2d0b";

export interface WeatherDatum {
  date: Date;
  weather: String; // coarse description
  weatherDetailed: String; // detailed description
  weatherIcon: String; // iconID for weather icon
  temperature: number;
  pressure: number;
  humidity: number;
  cloudCoverage: number; // percent
  windSpeed: number; // meter per second
  windDirection: number; // degrees (meterological)
  rain: number; // volume last 3h in mm
  snow: number; // volume last 3h
}

export interface WeatherData {
  cityName: String;
  countryName: String;
  forcastCount: number; // number of available data points
  forcasts: WeatherDatum[];
  current: WeatherDatum;
  sunriseTime: Date;
  sunsetTime: Date;
}

export function pollWeatherData(cityName: String): Promise<WeatherData> {
  let forcastUrl = "http://api.openweathermap.org/data/2.5/forecast?q="
    + cityName
    + "&type=like&units=metric&APPID=" + API_KEY;
  let currentUrl = "http://api.openweathermap.org/data/2.5/weather?q="
    + cityName
    + "&type=like&units=metric&APPID=" + API_KEY;
  let currentJson;
  let forecastJson;
  return fetch(currentUrl).then(function(response) {
    return response.json();
  }).then(function(json) {
    if (json.cod !== 200 && json.cod !== "200") {
      throw new Error("Error fetching weather data, OpenWeatherMap.org responded with: " + json.cod
        + "\n total data received: \n" + JSON.stringify(json));
    }
    currentJson = json;
    return fetch(forcastUrl).then(function(response) {
      return response.json();
    }).then(function(json) {
      if (json.cod !== 200 && json.cod !== "200") {
        throw new Error("Error fetching forecast data OpenWeatherMap.org responded with: " + json.cod + ": " + json.message
          + "\n total data received: \n" + JSON.stringify(json));
      }
      forecastJson = json;
      let weatherData = parseData(currentJson, forecastJson);
      return Promise.resolve(weatherData);
    });
  });
}

function parseData(current: any, forecast: any): WeatherData {
  let weatherData: WeatherData = {
    cityName: forecast.city.name,
    countryName: forecast.city.country,
    forcastCount: forecast.cnt,
    current: null,
    forcasts: [],
    sunriseTime: new Date(current.sys.sunrise * 1000),
    sunsetTime: new Date(current.sys.sunset * 1000),
  };
  weatherData.current = parseDatum(current);
  for (let index = 0; index < weatherData.forcastCount; index++) {
    weatherData.forcasts.push(parseDatum(forecast.list[index]));
  }
  return weatherData;
}

function parseDatum(datum: any): WeatherDatum {
  return {
    date: new Date(datum.dt * 1000),
    weather: datum.weather[0].main,
    weatherDetailed: datum.weather[0].description,
    weatherIcon: datum.weather[0].icon,
    temperature: datum.main.temp,
    pressure: datum.main.pressure,
    humidity: datum.main.humidity,
    cloudCoverage: datum.clouds.all,
    windSpeed: datum.wind.speed,
    windDirection: datum.wind.deg,
    rain: datum.rain.hasOwnProperty("3h") ? datum.rain["3h"] : 0,
    snow: datum.hasOwnProperty("3h") ? datum.snow["3h"] : 0
  };
}
