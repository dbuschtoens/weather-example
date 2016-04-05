/// <reference path="../typings/browser.d.ts" />
import {WeatherData} from "./weatherService";

const textColor = "rgb(255, 255,255)";
const MARGIN = 8;
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const smallFont = "thin 19px sans-serif";
const smallFontItalic = "italic thin 19px sans-serif";
const bigFont = "thin 28px sans-serif";

interface CurrentWeatherViewProperties extends tabris.CompositeProperties {
  data: WeatherData;
}

export default class CurrentWeatherView extends tabris.Composite {
  private font: string;
  private iconSize: number;
  
  constructor(properties: CurrentWeatherViewProperties) {
    super(properties);
    let data = properties.data;
    let height = Math.max(200, <number>properties.height);
    this.font = "thin " + (height * 0.5) + "px sans-serif";
    this.iconSize = height * 0.5;
    let centerBox = new tabris.Composite({
      top: 0,
      centerX: 0
    }).appendTo(this);
    this.createWeatherIcon(data.list[0].weatherIcon).appendTo(centerBox);
    this.createTemperatureText(Math.round(data.list[0].temperature)).appendTo(centerBox);
    this.createWeatherText(data.list[0].weatherDetailed).appendTo(this);
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
      centerY: 0,
      width: this.iconSize,
      height: this.iconSize,
      scaleMode: "stretch",
      image: "/icons/" + icon + ".png"
    });
  }
  createTemperatureText(temperature: number) {
    return new tabris.TextView({
      centerY: 0,
      left: "prev()",
      text: Math.round(temperature) + "°C",
      textColor: textColor,
      font: this.font
    });
  }
  
  createWeatherText(text: string) {
    return new tabris.TextView({
      top: "prev()",
      centerX: 0,
      text: text,
      textColor: textColor,
      font: bigFont
    })
  }
}

