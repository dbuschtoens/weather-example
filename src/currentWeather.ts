/// <reference path="../node_modules/tabris/tabris.d.ts"/>
import {WeatherData} from "./weatherService";

export default class CurrentWeather extends tabris.Composite {
  constructor(data: WeatherData, properties: Object) {
    super(properties);
    const textColor = "rgb(255, 255,255)";
    const MARGIN = 8;
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const smallFont = "15px";
    let cityText = new tabris.TextView({
      top: 0,
      centerX: 0,
      text: data.cityName,
      textColor: textColor,
      font: "bold 32px"
    });
    cityText.appendTo(this);
    let dayText = new tabris.TextView({
      top: "prev()",
      centerX: 0,
      text: days[data.current.date.getDay()] + " " + data.current.date.getDate(),
      textColor: textColor,
      font: smallFont
    });
    dayText.appendTo(this);
    let timeText = new tabris.TextView({
      top: "prev()",
      centerX: 0,
      text: data.current.date.getHours() + ":00",
      textColor: textColor,
      font: "italic " + smallFont
    });
    timeText.appendTo(this);
    let tempText = new tabris.TextView({
      top: "prev()",
      centerX: 0,
      text: Math.round(data.current.temperature) + "°C",
      textColor: textColor,
      font: "bold 48px"
    });
    tempText.appendTo(this);
    let weatherIcon = new tabris.ImageView({
      bottom: 0,
      centerX: 0,
      image: "/icons/" + data.current.weatherIcon + ".png"
    });
    weatherIcon.appendTo(this);
  }
}

