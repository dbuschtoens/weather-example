/// <reference path="../typings/browser.d.ts" />
import {WeatherData, WeatherDatum} from "./weatherService";
const textColor = "rgb(255, 255,255)";
const margin = 8;
const innerMargin = 8;
const daysAbbreviations = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const smallFont = "thin 19px sans-serif";
const smallFontItalic = "italic thin 19px sans-serif";
const bigFont = "thin 28px sans-serif";
const biggerFont = "thin 32px sans-serif";

const headerHeight = 60;

interface ForecastScrollViewProperties extends tabris.CompositeProperties {
  data: WeatherData;
}

export default class ForecastScrollView extends tabris.Composite {
  private tabs: tabris.Tab[];
  private scrollView: tabris.ScrollView;
  private tabFolder: tabris.TabFolder;

  constructor(properties: ForecastScrollViewProperties) {
    super(properties);
    let data = properties.data;
    this.tabFolder = <tabris.TabFolder>new tabris.TabFolder({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      tabBarLocation: "hidden",
      paging: true
    }).appendTo(this);
    this.tabs = [];
    for (let index = 0; index <= data.days.length; index++) {
      this.tabs[index] = new tabris.Tab({});
      this.createForecastTab(data, index).appendTo(this.tabs[index]);
      this.tabFolder.append(this.tabs[index]);
    }
  }

  createForecastTab(data: WeatherData, tab: number) {
    if (tab === 1) {
      return this.createForecastOverview(data);
    }
    let container = new tabris.Composite({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    });
    let day = (tab === 0) ? 0 : tab - 1;
    let headerName = (tab === 0) ? "Current Weather" : dayNames[data.days[day][0].date.getDay()];
    this.createHeader(headerName).appendTo(container);
    let scrollView = <tabris.ScrollView>new tabris.ScrollView({
      top: "prev()",
      left: 0,
      right: 0,
      bottom: 0
    }).appendTo(container);
    this.createForecastBox(data.days[day][0]).set("top", 0).appendTo(scrollView);
    for (let index = 1; index < data.days[day].length; index++) {
      this.createForecastBox(data.days[day][index]).appendTo(scrollView);
    }
    return container;
  }
  createForecastOverview(data: WeatherData) {
    let container = new tabris.Composite({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    });
    this.createHeader("Overview").appendTo(container);
    let scrollView = <tabris.ScrollView>new tabris.ScrollView({
      top: "prev()",
      left: 0,
      right: 0,
      bottom: 0
    }).appendTo(container);
    this.createDayForecastBox(data.days[0]).set("top", 0).appendTo(scrollView);
    for (let index = 1; index < data.days.length; index++) {
      this.createDayForecastBox(data.days[index]).appendTo(scrollView);
    }
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
    new tabris.ImageView({
      image: "./icons/arrowLeft.png",
      left: 0,
      centerY: 0,
      height: 50,
      highlightOnTouch: true
    }).on("tap", () => {
      // todo: change tab
    }).appendTo(container);
    new tabris.ImageView({
      image: "./icons/arrowRight.png",
      right: 0,
      centerY: 0,
      height: 50,
      highlightOnTouch: true
    }).on("tap", () => {
      // todo: change tab
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
      text: daysAbbreviations[forecast.date.getDay()], // + " " + forecast.date.getDate(),
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
