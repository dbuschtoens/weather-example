/// <reference path="../node_modules/tabris/tabris.d.ts"/>
import {WeatherData} from "./weatherService";

export default class ForcastScroll extends tabris.Composite {
  constructor(data: WeatherData, properties: Object) {
    super(properties);
    const textColor = "rgb(255, 255,255)";
    const margin = 8;
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const forcastBoxWidth = 90;
    const forcastBoxHeight = 120;
    const smallFont = "15px";
    let scroll = new tabris.ScrollView({
      top: "prev()",
      left: 0,
      right: 0,
      direction: "horizontal"
    });
    scroll.appendTo(this);
    for (let index = 0; index < data.forcastCount; index++) {
      let forcastContainer = new tabris.Composite({
        top: 0,
        left: "prev()",
      });
      forcastContainer.appendTo(scroll);
      let forcastDetail = new tabris.Composite({
        top: margin,
        left: margin,
        width: forcastBoxWidth,
        height: forcastBoxHeight,
        background: "rgba(26, 26, 26, 0.3)"
      });
      forcastDetail.appendTo(forcastContainer);
      let dayText = new tabris.TextView({
        top: 0,
        centerX: 0,
        text: days[data.forcasts[index].date.getDay()] + " " + data.forcasts[index].date.getDate(),
        textColor: textColor,
        font: smallFont
      });
      dayText.appendTo(forcastDetail);
      let timeText = new tabris.TextView({
        top: "prev()",
        centerX: 0,
        text: data.forcasts[index].date.getHours() + ":00",
        textColor: textColor,
        font: "italic " + smallFont
      });
      timeText.appendTo(forcastDetail);
      let weatherIcon = new tabris.ImageView({
        bottom: 0, // "prev() -10",
        centerX: 0,
        image: "/icons/" + data.forcasts[index].weatherIcon + ".png"
      });
      weatherIcon.appendTo(forcastDetail);
      let temperatureText = new tabris.TextView({
        bottom: "prev() -10",
        centerX: 0,
        text: Math.round(data.forcasts[index].temperature) + "°C",
        textColor: textColor,
        font: "bold 28px"
      });
      temperatureText.appendTo(forcastDetail);
      if (index > 0 && data.forcasts[index].date.getDay() === data.forcasts[index - 1].date.getDay()) {
        // only show day on first forcast of that day
        dayText.set("text", "");
      }
      let spacer = new tabris.Composite({
        // makes it so that the scrollbar doesn't overlap with the forcast detail boxes  
        top: "prev()",
        height: 10,
      }).appendTo(forcastContainer);
    }
  }
}
