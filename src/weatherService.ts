/// <reference path="../typings/browser.d.ts" />

const API_KEY = "ad695b2c2a3a0a72424a57e42adf2d0b";

export function pollWeatherData(cityName: String): Promise<WeatherData> {
  let forecastUrl = "http://api.openweathermap.org/data/2.5/forecast?q="
    + cityName
    + "&type=like&units=metric&APPID=" + API_KEY;
  let currentUrl = "http://api.openweathermap.org/data/2.5/weather?q="
    + cityName
    + "&type=like&units=metric&APPID=" + API_KEY;

  let currentPromise = fetchWithBackoff(currentUrl).then(validateResponse);
  let forecastPromise = fetchWithBackoff(forecastUrl, 50).then(validateResponse);
  return Promise.all([currentPromise, forecastPromise])
    .then((jsons) => Promise.resolve(new WeatherData(jsons[0], jsons[1])));
}

function fetchWithBackoff(url: string, waitTime?: number): Promise<Response> {
  return new Promise((resolve, reject) => {
    if (waitTime > 2000) {
      reject("Timeout fetching data");
    }
    setTimeout(() => {
      fetch(url)
        .then((response) => {
          if (response.ok) {
            resolve(response);
          } else if (response.status === 429) {
            resolve(fetchWithBackoff(url, waitTime ? (2 * waitTime) : 50));
          } else {
            reject(response);
          }
        });
    }, waitTime);
  });
}
function validateResponse(response: any) {
  if (!response.ok) {
    console.log("weatherAPI status code : " + response.status);
    throw new Error("Error fetching weather data");
  }
  return response.json();
}

export class WeatherData {
  public cityName: string;
  public countryName: string;
  public forecasts: WeatherDatum[];
  public current: WeatherDatum;
  public sunriseTime: Date;
  public sunsetTime: Date;

  constructor(current: any, forecast: any) {
    this.cityName = forecast.city.name;
    this.countryName = forecast.city.country;
    this.current = null;
    this.forecasts = [];
    this.sunriseTime = new Date(current.sys.sunrise * 1000);
    this.sunsetTime = new Date(current.sys.sunset * 1000);
    this.current = this.parseDatum(current);
    this.forecasts = forecast.list.map(this.parseDatum);
  }

  private parseDatum(datum: any): WeatherDatum {
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
}

export interface WeatherDatum {
  date: Date;
  weather: string; // coarse description
  weatherDetailed: string; // detailed description
  weatherIcon: string; // iconID for weather icon
  temperature: number;
  pressure: number;
  humidity: number;
  cloudCoverage: number; // percent
  windSpeed: number; // meter per second
  windDirection: number; // degrees (meterological)
  rain: number; // volume last 3h in mm
  snow: number; // volume last 3h
}