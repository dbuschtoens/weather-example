let API_KEY = "ad695b2c2a3a0a72424a57e42adf2d0b";

export interface DataPoint {
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

export interface Data {
  cityName: String;
  countryName: String;
  dataCount: number; // number of available data points
  dataPoints: DataPoint[]
}

export function poll(cityName: String): Promise<Data> {
  let url = "http://api.openweathermap.org/data/2.5/forecast?q="
    + cityName
    + "&type=like&units=metric&APPID=" + API_KEY;
  return fetch(url).then(function(response) {
    return response.json();
  }).then(function(json) {
    if (json.cod !== "200") {
      throw new Error("OpenWeatherMap.org responded with: " + json.cod + ": " + json.message);
    }
    let weatherData = parseJson(json);
    return Promise.resolve(weatherData);
  });
}

function parseJson(json: any): Data {
  let weatherData: Data = {
    cityName: json.city.name,
    countryName: json.city.country,
    dataCount: json.cnt,
    dataPoints: []
  };
  for (let index = 0; index < weatherData.dataCount; index++) {
    let date = new Date(json.list[index].dt * 1000);
    let rain = json.list[index].rain.hasOwnProperty("3h") ? json.list[index].rain["3h"] : 0;
    let snow = json.list[index].hasOwnProperty("3h") ? json.list[index].snow["3h"] : 0;
    let weatherDataPoint: DataPoint = {
      date: date,
      weather: json.list[index].weather.main,
      weatherDetailed: json.list[index].weather.description,
      weatherIcon: json.list[index].weather.icon,
      temperature: json.list[index].main.temp,
      pressure: json.list[index].main.pressure,
      humidity: json.list[index].main.humidity,
      cloudCoverage: json.list[index].clouds.all,
      windSpeed: json.list[index].wind.speed,
      windDirection: json.list[index].wind.deg,
      rain: rain,
      snow: snow
    };
    weatherData.dataPoints.push(weatherDataPoint);
  }
  return weatherData;
}
