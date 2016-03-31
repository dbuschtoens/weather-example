/// <reference path="../node_modules/tabris/tabris.d.ts"/>
import {WeatherData, WeatherDatum} from "./weatherService";
const textColor = "rgb(255, 255,255)";
const margin = 8;
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const forcastBoxWidth = 90;
const forcastBoxHeight = 120;
const smallFont = "15px";

export default class ForcastScrollView extends tabris.ScrollView {
  private scrollView: tabris.ScrollView;

  constructor(data: WeatherData, properties: any) {
    properties.direction = "horizontal";
    super(properties);
    this.createForcastBox(data.forcasts[0]).set("left", 0).appendTo(this);
    for (let index = 1; index < data.forcasts.length; index++) {
      this.createForcastBox(data.forcasts[index], data.forcasts[index - 1]).appendTo(this);
    }
  }

  createForcastBox(forcast: WeatherDatum, previous?: WeatherDatum) {
    let container = new tabris.Composite({
      top: 0,
      left: "prev()",
    });
    let forcastBox = new tabris.Composite({
      top: margin,
      left: margin,
      width: forcastBoxWidth,
      height: forcastBoxHeight,
      background: "rgba(226, 226, 226, 0.3)"
    });
    forcastBox.appendTo(container);
    let dayText = this.createDayText(forcast).appendTo(forcastBox);
    if ((previous) && forcast.date.getDay() === previous.date.getDay()) {
      dayText.set("text", "");
    }
    this.createTimeText(forcast).appendTo(forcastBox);
    this.createWeatherIcon(forcast).appendTo(forcastBox);
    this.createTemperatureText(forcast).appendTo(forcastBox);
    this.createSpacer().appendTo(container);
    return container;
  }
  createDayText(forcast) {
    return new tabris.TextView({
      top: 0,
      centerX: 0,
      text: days[forcast.date.getDay()] + " " + forcast.date.getDate(),
      textColor: textColor,
      font: smallFont
    });
  }
  createTimeText(forcast) {
    return new tabris.TextView({
      top: "prev()",
      centerX: 0,
      text: forcast.date.getHours() + ":00",
      textColor: textColor,
      font: "italic " + smallFont
    });
  }
  createWeatherIcon(forcast) {
    return new tabris.ImageView({
      bottom: 0,
      width: 50,
      height: 50,
      centerX: 0,
      image: "/icons/" + forcast.weatherIcon + ".png"
    });
  }
  createTemperatureText(forcast) {
    return new tabris.TextView({
      bottom: "prev() -10",
      centerX: 0,
      text: Math.round(forcast.temperature) + "°C",
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
