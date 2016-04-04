/// <reference path="../typings/browser.d.ts" />
import {WeatherData, WeatherDatum} from "./weatherService";
const textColor = "rgb(255, 255,255)";
const margin = 8;
const innerMargin = 8;
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const smallFont = "thin 19px sans-serif";
const smallFontItalic = "italic thin 19px sans-serif";
const bigFont = "thin 28px sans-serif";
const biggerFont = "thin 32px sans-serif";

const headerHeight = 60;

interface ForecastScrollViewProperties extends tabris.CompositeProperties {
  data: WeatherData;
}

export default class ForecastScrollView extends tabris.Composite {
  private scrollView: tabris.ScrollView;

  constructor(properties: ForecastScrollViewProperties) {
    super(properties);
    let data = properties.data;
    this.createHeader("Overview").appendTo(this);
    this.scrollView = <tabris.ScrollView>new tabris.ScrollView({ top: "prev()", left: 0, right: 0, bottom: 0 }).appendTo(this);
    // this.createTextExamples();

    this.createDayForecastBox(data.days[0]).set("top", 0).appendTo(this.scrollView);
    for (let index = 1; index < data.days.length; index++) {
      this.createDayForecastBox(data.days[index]).appendTo(this.scrollView);
    }
    for (let index = 0; index < data.list.length; index++) {
      this.createForecastBox(data.list[index]).appendTo(this.scrollView);
    }

  }

createTextExamples() {
    let fontStyles = ["normal", "italic"];
    let fontWeights = ["light", "thin", "normal", "medium", "bold", "black"];
    let fontFamilies = ["serif", "sans-serif", "condensed", "monospace"];
    for (let style of fontStyles) {
      for (let weight of fontWeights) {
        for (let family of fontFamilies) {
          this.createTextExample(style + " " + weight + " 20px " + family).appendTo(this.scrollView);
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
  
  createHeader(text: string) {
    let container = new tabris.Composite({
      top: 0,
      left: margin,
      right: margin,
      height: headerHeight,
      background: "rgba(255,255,255,0.8)"
    });
    new tabris.TextView({
      text: text,
      centerY: 0,
      centerX: 0,
      font: bigFont,
      textColor: "#000000"
    }).appendTo(container);
    return container;
  }

  createDayForecastBox(dayForecasts: WeatherDatum[]) {
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
    let minTemp = Math.min(...dayForecasts.map((forecast) => forecast.temperature));
    let maxTemp = Math.max(...dayForecasts.map((forecast) => forecast.temperature));
    this.createDayText(dayForecasts[0]).appendTo(forecastBox);
    this.createWeatherText(WeatherData.getAverageWeatherDescription(dayForecasts)).appendTo(forecastBox);
    this.createTemperatureRangeText(maxTemp, minTemp).appendTo(forecastBox);
    return container;
  }

  createDayText(forecast: WeatherDatum) {
    return new tabris.TextView({
      top: innerMargin,
      bottom: innerMargin,
      left: innerMargin,
      text: days[forecast.date.getDay()], // + " " + forecast.date.getDate(),
      textColor: textColor,
      font: bigFont
    });
  }

  createTemperatureRangeText(maxTemp: number, minTemp: number) {
    let container = new tabris.Composite({
      right: margin,
      centerY: 0
    });
    let maxTempText = new tabris.TextView({
      text: Math.round(maxTemp) + "°C /",
      textColor: textColor,
      font: bigFont
    }).appendTo(container);
    new tabris.TextView({
      left: "prev()",
      text: Math.round(minTemp) + "°C",
      textColor: "rgb(200, 200, 220)",
      baseline: maxTempText,
      font: smallFont
    }).appendTo(container);
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
    this.createWeatherText(forecast.weatherDetailed).appendTo(forecastBox);
    this.createTemperatureText(forecast.temperature).appendTo(forecastBox);
    this.createWeatherIcon(forecast).appendTo(forecastBox);
    return container;
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
  createWeatherText(text: string) {
    return new tabris.TextView({
      centerY: 0,
      left: "prev() 10",
      text: text,
      textColor: textColor,
      font: smallFontItalic
    });
  }
  createTemperatureText(temperature: number) {
    return new tabris.TextView({
      right: margin,
      centerY: 0,
      text: Math.round(temperature) + "°C",
      textColor: textColor,
      font: bigFont
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
}
