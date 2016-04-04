/// <reference path="../typings/browser.d.ts" />

const API_KEY = "ad695b2c2a3a0a72424a57e42adf2d0b";

export function pollWeatherData(cityName: String): Promise<WeatherData> {
  cityName = cityName.trim();
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
  public list: WeatherDatum[];
  public days: WeatherDatum[][];
  public sunriseTime: Date;
  public sunsetTime: Date;

  constructor(current: any, forecast: any) {
    this.cityName = forecast.city.name;
    this.countryName = forecast.city.country;
    this.sunriseTime = new Date(current.sys.sunrise * 1000);
    this.sunsetTime = new Date(current.sys.sunset * 1000);
    this.list = [this.parseDatum(current)].concat(forecast.list.map(this.parseDatum));
    this.days = [];
    let day = this.list[0].date.getDate();
    let matchDay = (datum) => datum.date.getDate() === day;
    while (this.list.some(matchDay)) {
      this.days.push(this.list.filter(matchDay));
      day++;
    }
  }

  public getWeatherAtDate(date: Date) {
    if (date < this.list[0].date) {
      return this.list[0];
    }
    for (let index = 0; index < this.list.length - 1; index++) {
      if (this.list[index].date <= date && this.list[index + 1].date >= date) {
        return this.linearInterpolate(this.list[index], this.list[index + 1], date.getTime());
      }
    }
    return this.list[this.list.length - 1];
  }

  private linearInterpolate(previous: WeatherDatum, next: WeatherDatum, time: number): WeatherDatum {
    let [prevTime, nextTime] = [previous.date.getTime(), next.date.getTime()];
    let a = (time - prevTime) / (nextTime - prevTime);
    return {
      date: new Date(time),
      weather: (a < 0.5) ? previous.weather : next.weather,
      weatherDetailed: (a < 0.5) ? previous.weatherDetailed : next.weatherDetailed,
      weatherIcon: (a < 0.5) ? previous.weatherIcon : next.weatherIcon,
      temperature: previous.temperature + a * (next.temperature - previous.temperature),
      pressure: previous.pressure + a * (next.pressure - previous.pressure),
      humidity: previous.humidity + a * (next.humidity - previous.humidity),
      cloudCoverage: previous.cloudCoverage + a * (next.cloudCoverage - previous.cloudCoverage),
      windSpeed: previous.windSpeed + a * (next.windSpeed - previous.windSpeed),
      windDirection: previous.windDirection + a * (next.windDirection - previous.windDirection),
      rain: previous.rain + a * (next.rain - previous.rain),
      snow: previous.snow + a * (next.snow - previous.snow),
    }
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
      rain: datum.rain ? datum.rain.hasOwnProperty("3h") ? datum.rain["3h"] : 0 : 0,
      snow: datum.snow ? datum.snow.hasOwnProperty("3h") ? datum.snow["3h"] : 0 : 0
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