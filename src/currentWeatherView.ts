/// <reference path="../typings/browser.d.ts" />
import {WeatherData} from "./weatherService";

const textColor = "rgb(255, 255,255)";
const MARGIN = 8;
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const smallFont = "15px";

interface CurrentWeatherViewProperties extends tabris.CompositeProperties {
  data: WeatherData;
}

export default class CurrentWeatherView extends tabris.Composite {
    constructor(properties: CurrentWeatherViewProperties) {
    super(properties);
    let data = properties.data;
    this.createCityNameText(data.cityName + ", " + data.countryName).appendTo(this);
    this.createText(days[data.current.date.getDay()] + " " + data.current.date.getDate()).appendTo(this);
    this.createItalicText(data.current.date.getHours() + ":00").appendTo(this);
    this.createWeatherIcon(data.current.weatherIcon).appendTo(this);
    this.createTemperatureText(Math.round(data.current.temperature)).appendTo(this);
  }
  createCityNameText(text: string) {
    return new tabris.TextView({
      top: 0,
      centerX: 0,
      text: text,
      textColor: textColor,
      font: "bold 32px"
    });
  }
  createText(text: string) {
    return new tabris.TextView({
      top: "prev()",
      centerX: 0,
      text: text,
      textColor: textColor,
      font: smallFont
    });
  }
  createItalicText(text: string) {
    return new tabris.TextView({
      top: "prev()",
      centerX: 0,
      text: text,
      textColor: textColor,
      font: "italic " + smallFont
    });
  }
  createWeatherIcon(icon: string) {
    return new tabris.ImageView({
      top: "prev()",
      centerX: 0,
      width: 100,
      height: 100,
      scaleMode: "stretch",
      image: "/icons/" + icon + ".png"
    });
  }
  createTemperatureText(temperature: number) {
    return new tabris.TextView({
      top: "prev()",
      centerX: 0,
      text: Math.round(temperature) + "°C",
      textColor: textColor,
      font: "bold 48px"
    });
  }
}

