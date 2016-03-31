const API_KEY = "ad695b2c2a3a0a72424a57e42adf2d0b";

export function pollWeatherData(cityName: String): Promise<WeatherData> {
  let forecastUrl = "http://api.openweathermap.org/data/2.5/forecast?q="
    + cityName
    + "&type=like&units=metric&APPID=" + API_KEY;
  let currentUrl = "http://api.openweathermap.org/data/2.5/weather?q="
    + cityName
    + "&type=like&units=metric&APPID=" + API_KEY;

  let currentPromise = fetch(currentUrl)
    .then((response) => response.json())
    .then(checkResponse);

  let forecastPromise = fetch(forecastUrl)
    .then((response) => response.json())
    .then(checkResponse);

  return Promise.all([currentPromise, forecastPromise])
    .then((jsons) => Promise.resolve(new WeatherData(jsons[0], jsons[1])));
}

function checkResponse(json: any) {
  if (json.cod !== 200 && json.cod !== "200") {
    throw new Error("Error fetching data, OpenWeatherMap.org responded with: " + JSON.stringify(json));
  }
  return json;
}

export class WeatherData {
  public cityName: String;
  public countryName: String;
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