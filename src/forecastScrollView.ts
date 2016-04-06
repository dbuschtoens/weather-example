/// <reference path="../typings/browser.d.ts" />
import {WeatherData, WeatherDatum} from "./weatherService";
const textColor = "rgb(255, 255,255)";
const margin = 5;
const innerMargin = 6;
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const smallFont = "thin 19px sans-serif";
const smallFontItalic = "italic thin 19px sans-serif";
const bigFont = "thin 28px sans-serif";

const headerHeight = 50;
const forecastBoxHeight = 45;
const iconSize = 35;

interface ForecastScrollViewProperties extends tabris.TabFolderProperties {
  data: WeatherData;
}

export default class ForecastScrollView extends tabris.TabFolder {
  private data: WeatherData;
  private tabs: tabris.Tab[];
  private boxesInTabs: tabris.Composite[][];
  private scrollView: tabris.ScrollView;

  constructor(properties: ForecastScrollViewProperties) {
    properties.height = headerHeight + 8 * forecastBoxHeight;
    properties.tabBarLocation = "hidden";
    properties.paging = true;
    super(properties);
    this.data = properties.data;
    this.tabs = [this.createTab("today", true, false)];
    this.append(this.tabs[0]);
    this.boxesInTabs = [];
    let numDays = this.data.days.length;
    for (let index = 1; index < numDays - 1; index++) {
      let headerName = dayNames[this.data.days[index][0].date.getDay()];
      this.tabs.push(this.createTab(headerName, false, false));
      this.append(this.tabs[index]);
    }
    this.tabs.push(this.createTab(dayNames[this.data.days[numDays - 1][0].date.getDay()], false, true));
    this.append(this.tabs[numDays - 1]);
    this.on("change:selection", (widget: ForecastScrollView, selection) => {
      widget.fillTab(selection);
    });
    this.fillTab(this.tabs[0]);
  }

  createTab(text: string, isFirst: boolean, isLast: boolean) {
    let tab = new tabris.Tab();
    this.createHeader(text, isFirst, isLast).appendTo(tab);
    return tab;
  }

  fillTab(tab: tabris.Tab) {
    for (let boxesInTab of this.boxesInTabs) {
      if (boxesInTab === undefined) continue;
      for (let box of boxesInTab) {
        box.dispose();
      }
      boxesInTab = [];
    }
    let day = this.tabs.indexOf(tab);
    this.boxesInTabs[day] = [];
    setTimeout(() => this.spawnForecastBoxRecurse(day, 0), 200);

  }

  spawnForecastBoxRecurse(day: number, forecast: number) {
    if (forecast >= this.data.days[day].length) {
      return;
    }
    let forecastBox = this.createForecastBox(this.data.days[day][forecast]).appendTo(this.tabs[day]);
    this.boxesInTabs[day].push(forecastBox);
    forecastBox.set({
      opacity: 0.0,
    });
    forecastBox.animate({
      opacity: 1.0,
    }, {
        duration: 500,
        easing: "ease-out"
      });
    setTimeout(() => this.spawnForecastBoxRecurse(day, forecast + 1), 20);
  }

  createHeader(text: string, isFirst: boolean, isLast: boolean) {
    let container = new tabris.Composite({
      top: 0,
      left: 0,
      right: 0,
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
    if (!isFirst) {
      new tabris.ImageView({
        image: "./icons/arrowLeft.png",
        left: 0,
        centerY: 0,
        height: 50,
        highlightOnTouch: true
      }).on("tap", () => {
        // todo: change tab
      }).appendTo(container);
    }
    if (!isLast) {
      new tabris.ImageView({
        image: "./icons/arrowRight.png",
        right: 0,
        centerY: 0,
        height: 50,
        highlightOnTouch: true
      }).on("tap", () => {
        // todo: change tab
      }).appendTo(container);
    }
    return container;
  }

  createForecastBox(forecast: WeatherDatum) {
    let container = new tabris.Composite({
      top: "prev()",
      left: 0,
      right: 0,
      height: forecastBoxHeight
    });
    let forecastBox = <tabris.Composite>new tabris.Composite({
      top: margin,
      left: margin,
      right: margin,
      background: "rgba(255, 255, 255, 0.2)"
    }).appendTo(container);
    this.createTimeText(forecast.date).appendTo(forecastBox);
    this.createWeatherText(forecast.weatherDetailed).appendTo(forecastBox);
    this.createTemperatureText(forecast.temperature).appendTo(forecastBox);
    this.createWeatherIcon(forecast.weatherIcon).appendTo(forecastBox);
    return container;
  }
  createTimeText(date: Date) {
    let minutes = date.getMinutes();
    let hours = date.getHours();
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
  createWeatherIcon(icon: string) {
    return new tabris.ImageView({
      right: "prev()",
      width: iconSize,
      height: iconSize,
      centerY: 0,
      image: "/icons/" + icon + ".png"
    });
  }
}
