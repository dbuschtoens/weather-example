"use strict";
var API_KEY = "ad695b2c2a3a0a72424a57e42adf2d0b";
function pollWeatherData(cityName) {
    cityName = cityName.trim();
    var forecastUrl = "http://api.openweathermap.org/data/2.5/forecast?q="
        + cityName
        + "&type=like&units=metric&APPID=" + API_KEY;
    var currentUrl = "http://api.openweathermap.org/data/2.5/weather?q="
        + cityName
        + "&type=like&units=metric&APPID=" + API_KEY;
    var currentPromise = fetchWithBackoff(currentUrl).then(validateResponse);
    var forecastPromise = fetchWithBackoff(forecastUrl, 50).then(validateResponse);
    return Promise.all([currentPromise, forecastPromise])
        .then(function (jsons) { return Promise.resolve(new WeatherData(jsons[0], jsons[1])); });
}
exports.pollWeatherData = pollWeatherData;
function fetchWithBackoff(url, waitTime) {
    return new Promise(function (resolve, reject) {
        if (waitTime > 2000) {
            reject("Timeout fetching data");
        }
        setTimeout(function () {
            fetch(url)
                .then(function (response) {
                if (response.ok) {
                    resolve(response);
                }
                else if (response.status === 429) {
                    resolve(fetchWithBackoff(url, waitTime ? (2 * waitTime) : 50));
                }
                else {
                    reject(response);
                }
            });
        }, waitTime);
    });
}
function validateResponse(response) {
    if (!response.ok) {
        console.log("weatherAPI status code : " + response.status);
        throw new Error("Error fetching weather data");
    }
    return response.json().then(validateJson);
}
function validateJson(json) {
    if (json.cod !== 200 && json.cod !== "200") {
        throw new Error(json.message);
    }
    return json;
}
var WeatherData = (function () {
    function WeatherData(current, forecast) {
        this.cityName = forecast.city.name;
        this.countryName = forecast.city.country;
        this.sunriseTime = new Date(current.sys.sunrise * 1000);
        this.sunsetTime = new Date(current.sys.sunset * 1000);
        this.list = [this.parseDatum(current)].concat(forecast.list.map(this.parseDatum));
        this.days = [];
        var day = this.list[0].date.getDate();
        var matchDay = function (datum) { return datum.date.getDate() === day; };
        while (this.list.some(matchDay)) {
            this.days.push(this.list.filter(matchDay));
            day++;
        }
    }
    WeatherData.getAverageWeatherDescription = function (day) {
        var cloudForecasts = day.filter(function (forecast) { return (forecast.weather === "Clouds"); }).length;
        var rainForecasts = day.filter(function (forecast) { return (forecast.weather === "Rain"); }).length;
        var snowForecasts = day.filter(function (forecast) { return (forecast.weather === "Snow"); }).length;
        if (rainForecasts > 3) {
            return "rain";
        }
        if (snowForecasts > 3) {
            return "snow";
        }
        if (cloudForecasts > 2 && rainForecasts > 0) {
            return "cloudy, some rain";
        }
        if (cloudForecasts > 2 && snowForecasts > 0) {
            return "cloudy, some snow";
        }
        if (cloudForecasts > 3) {
            return "cloudy";
        }
        return "clear";
    };
    WeatherData.prototype.getWeatherAtDate = function (date) {
        if (date < this.list[0].date) {
            return this.list[0];
        }
        for (var index = 0; index < this.list.length - 1; index++) {
            if (this.list[index].date <= date && this.list[index + 1].date >= date) {
                return this.linearInterpolate(this.list[index], this.list[index + 1], date.getTime());
            }
        }
        return this.list[this.list.length - 1];
    };
    WeatherData.prototype.linearInterpolate = function (previous, next, time) {
        var _a = [previous.date.getTime(), next.date.getTime()], prevTime = _a[0], nextTime = _a[1];
        var a = (time - prevTime) / (nextTime - prevTime);
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
        };
    };
    WeatherData.prototype.parseDatum = function (datum) {
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
    };
    return WeatherData;
}());
exports.WeatherData = WeatherData;
