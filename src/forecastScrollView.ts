/// <reference path="../typings/browser.d.ts" />
import {WeatherData, WeatherDatum} from "./weatherService";
const textColor = "rgb(255, 255,255)";
const margin = 8;
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const forecastBoxWidth = 90;
const forecastBoxHeight = 120;
const smallFont = "15px";

interface ForecastScrollViewProperties extends tabris.ScrollViewProperties {
  data: WeatherData;
}

export default class ForecastScrollView extends tabris.ScrollView {
  private scrollView: tabris.ScrollView;

  constructor(properties: ForecastScrollViewProperties) {
    properties.direction = "horizontal";
    super(properties);
    let data = properties.data;
    this.createForecastBox(data.list[0]).set("left", 0).appendTo(this);
    for (let index = 1; index < data.list.length; index++) {
      this.createForecastBox(data.list[index], data.list[index - 1]).appendTo(this);
    }
  }

  createForecastBox(forecast: WeatherDatum, previous?: WeatherDatum) {
    let container = new tabris.Composite({
      top: 0,
      left: "prev()",
    });
    let forecastBox = new tabris.Composite({
      top: margin,
      left: margin,
      width: forecastBoxWidth,
      height: forecastBoxHeight,
      background: "rgba(226, 226, 226, 0.3)"
    });
    forecastBox.appendTo(container);
    let dayText = this.createDayText(forecast).appendTo(forecastBox);
    if ((previous) && forecast.date.getDay() === previous.date.getDay()) {
      dayText.set("text", "");
    }
    this.createTimeText(forecast).appendTo(forecastBox);
    this.createWeatherIcon(forecast).appendTo(forecastBox);
    this.createTemperatureText(forecast).appendTo(forecastBox);
    this.createSpacer().appendTo(container);
    return container;
  }
  createDayText(forecast) {
    return new tabris.TextView({
      top: 0,
      centerX: 0,
      text: days[forecast.date.getDay()] + " " + forecast.date.getDate(),
      textColor: textColor,
      font: smallFont
    });
  }
  createTimeText(forecast) {
    return new tabris.TextView({
      top: "prev()",
      centerX: 0,
      text: forecast.date.getHours() + ":00",
      textColor: textColor,
      font: "italic " + smallFont
    });
  }
  createWeatherIcon(forecast) {
    return new tabris.ImageView({
      bottom: 0,
      width: 50,
      height: 50,
      centerX: 0,
      image: "/icons/" + forecast.weatherIcon + ".png"
    });
  }
  createTemperatureText(forecast) {
    return new tabris.TextView({
      bottom: "prev() -10",
      centerX: 0,
      text: Math.round(forecast.temperature) + "°C",
      textColor: textColor,
      font: "bold 28px"
    });
  }
  createSpacer() {
    return new tabris.Composite({
      top: "prev()",
      height: 10
    });
  }
}
