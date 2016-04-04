/// <reference path="../typings/browser.d.ts" />
import {WeatherData, WeatherDatum} from "./weatherService";
const textColor = "rgb(255, 255,255)";
const margin = 8;
const innerMargin = 8;
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// const forecastBoxWidth = 90;
// const forecastBoxHeight = 120;
const smallFont = "thin 20px sans-serif";
const temperatureFont = "thin 28px sans-serif";

interface ForecastScrollViewProperties extends tabris.ScrollViewProperties {
  data: WeatherData;
}

export default class ForecastScrollView extends tabris.ScrollView {
  private scrollView: tabris.ScrollView;

  constructor(properties: ForecastScrollViewProperties) {
    properties.direction = "vertical";
    super(properties);
    let data = properties.data;
    this.createForecastBox(data.list[0]).set("top", 0).appendTo(this);
    // this.createTextExamples();
    for (let index = 1; index < data.list.length; index++) {
      this.createForecastBox(data.list[index]).appendTo(this);
    }
  }

  createTextExamples() {
    let fontStyles = ["normal", "italic"];
    let fontWeights = ["light", "thin", "normal", "medium", "bold", "black"];
    let fontFamilies = ["serif", "sans-serif", "condensed", "monospace"];
    for (let style of fontStyles) {
      for (let weight of fontWeights) {
        for (let family of fontFamilies) {
          this.createTextExample(style + " " + weight + " 20px " + family).appendTo(this);
        }
      }
    }
  }

  createTextExample(text: string) {
    let [r, g, b] = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
    let container = new tabris.Composite({
      top: "prev()",
      left: margin,
      right: margin
    });
    let forecastBox = <tabris.Composite>new tabris.Composite({
      top: margin,
      left: margin,
      right: margin,
      background: "rgba(255,255,255, 0.2)"
    }).appendTo(container);
    new tabris.TextView({
      top: innerMargin,
      left: innerMargin,
      bottom: innerMargin,
      text: text,
      textColor: textColor,
      font: text
    }).appendTo(forecastBox);
    return container;
  }

  createForecastBox(forecast: WeatherDatum) {
    let container = new tabris.Composite({
      top: "prev()",
      left: margin,
      right: margin
    });
    let forecastBox = <tabris.Composite>new tabris.Composite({
      top: margin,
      left: margin,
      right: margin,
      background: "rgba(255, 255, 255, 0.2)"
    }).appendTo(container);
    this.createTimeText(forecast).appendTo(forecastBox);
    this.createWeatherText(forecast).appendTo(forecastBox);
    this.createTemperatureText(forecast).appendTo(forecastBox);
    this.createWeatherIcon(forecast).appendTo(forecastBox);
    return container;
  }
  createDayText(forecast: WeatherDatum) {
    return new tabris.TextView({
      top: 0,
      centerX: 0,
      text: days[forecast.date.getDay()] + " " + forecast.date.getDate(),
      textColor: textColor,
      font: smallFont
    });
  }
  createTimeText(forecast: WeatherDatum) {
    let minutes = forecast.date.getMinutes();
    let hours = forecast.date.getHours();
    let hoursString = (hours < 10) ? "0" + hours : hours;
    let minutesString = (minutes < 10) ? "0" + minutes : minutes;
    return new tabris.TextView({
      top: innerMargin,
      bottom: innerMargin,
      left: innerMargin,
      text: hoursString + ":" + minutesString,
      textColor: textColor,
      font: smallFont
    });
  }
  createWeatherText(forecast: WeatherDatum) {
    return new tabris.TextView({
      top: innerMargin,
      bottom: innerMargin,
      left: "prev() 10",
      text: forecast.weatherDetailed,
      textColor: textColor,
      font: smallFont
    });
  }
  createTemperatureText(forecast: WeatherDatum) {
    return new tabris.TextView({
      right: margin,
      centerY: 0,
      text: Math.round(forecast.temperature) + "°C",
      textColor: textColor,
      font: temperatureFont
    });
  }
  createWeatherIcon(forecast: WeatherDatum) {
    return new tabris.ImageView({
      right: "prev()",
      width: 40,
      height: 40,
      centerY: 0,
      image: "/icons/" + forecast.weatherIcon + ".png"
    });
  }


  createSpacer() {
    return new tabris.Composite({
      top: "prev()",
      height: 10
    });
  }
}
