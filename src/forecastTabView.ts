
import {WeatherData, WeatherDatum} from "./weatherService";
const textColor = "rgb(255, 255, 255)";
const headerTextColor = "rgb(255, 255, 255)";
const infoBoxColor = "rgba(0, 0, 0, 0.2)";
const headerBoxColor = "rgba(0,0,0,0.4)"
const margin = 5;
const innerMargin = 6;
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const smallFont = "thin 19px sans-serif";
const smallFontItalic = "italic thin 19px sans-serif";
const bigFont = "thin 28px sans-serif";

const headerHeight = 50;
const forecastBoxHeight = 45;
const weatherIconSize = 35;
const navigationIconSize = 50;

interface ForecastTabViewProperties extends tabris.TabFolderProperties {
  data: WeatherData;
}

export default class ForecastTabView extends tabris.TabFolder {
  private data: WeatherData;
  private tabs: tabris.Tab[];
  private tabsLoaded: boolean[];
  private scrollView: tabris.ScrollView;
  private lazyLoading: boolean;
  private timeoutID: number;


  constructor(properties: ForecastTabViewProperties) {
    properties.height = headerHeight + 8 * forecastBoxHeight;
    properties.tabBarLocation = "hidden";
    properties.paging = true;
    super(properties);
    this.data = properties.data;
    this.tabs = [this.createTab("today", true, false)];
    this.append(this.tabs[0]);
    this.tabsLoaded = [];
    let numDays = this.data.days.length;
    for (let index = 1; index < numDays - 1; index++) {
      let headerName = dayNames[this.data.days[index][0].date.getDay()];
      this.tabs.push(this.createTab(headerName, false, false));
      this.append(this.tabs[index]);
    }
    this.tabs.push(this.createTab(dayNames[this.data.days[numDays - 1][0].date.getDay()], false, true));
    this.append(this.tabs[numDays - 1]);
    this.on("change:selection", (widget: ForecastTabView, selection) => {
      if (widget.lazyLoading) {
        clearTimeout(widget.timeoutID);
        setTimeout(() => widget.JITLoad(selection), 180);
      } else {
        widget.lazyLoading = true;
        widget.timeoutID = setTimeout(() => widget.fillTabs(selection), 800);
      }
    });
    this.fillTabs(this.tabs[0]);
  }

  public getTabIndex(tab: tabris.Tab) {
    return this.tabs.indexOf(tab);
  }

  private createTab(text: string, isFirst: boolean, isLast: boolean) {
    let tab = new tabris.Tab();
    this.createHeader(text, isFirst, isLast).appendTo(tab);
    return tab;
  }

  private fillTabs(selected: tabris.Tab) {
    let selectedTabNumber = this.tabs.indexOf(selected);
    let maxTabNumber = Math.min(this.tabs.length - 1, selectedTabNumber + 1);
    let minTabNumber = Math.max(0, selectedTabNumber - 1);
    for (let tabNumber = minTabNumber; tabNumber <= maxTabNumber; tabNumber++) {
      if (!this.tabsLoaded[tabNumber]) {
        for (let forecast of this.data.days[tabNumber]) {
          this.createForecastBox(forecast).appendTo(this.tabs[tabNumber]);
        }
        this.tabsLoaded[tabNumber] = true;
      }
    }
    this.lazyLoading = false;
  }

  // TODO: jitLoad
  private JITLoad(tab: tabris.Tab) {
    let day = this.tabs.indexOf(tab);
    if (!this.tabsLoaded[day]) {
      setTimeout(() => this.spawnForecastBoxRecurse(day, 0), 200);
      this.lazyLoading = true;
    }
    this.timeoutID = setTimeout(() => this.fillTabs(tab), 900);
  }

  private spawnForecastBoxRecurse(day: number, forecast: number) {
    if (forecast >= this.data.days[day].length) {
      return;
    }
    let forecastBox = this.createForecastBox(this.data.days[day][forecast]).appendTo(this.tabs[day]);
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

  // TODO: SMALLER!
  private createHeader(text: string, isFirst: boolean, isLast: boolean) {
    let container = new tabris.Composite({ top: 0, left: 0, right: 0, height: headerHeight, });
    let background = new tabris.Composite({ top: 0, left: margin, right: margin, background: headerBoxColor })
      .appendTo(container)
    new tabris.TextView({ text: text, centerY: 0, centerX: 0, font: bigFont, textColor: headerTextColor })
      .appendTo(background);
    if (!isFirst) {
      this.createArrowImage("left").appendTo(background);
    }
    if (!isLast) {
      this.createArrowImage("right").appendTo(background);
    }
    return container;
  }

  private createArrowImage(direction: string) {
    return new tabris.ImageView({
      image: "./icons/arrow" + direction + ".png",
      centerY: 0,
      height: 50,
      opacity: 0.6
    }).set(direction, 0);
  }

  private createForecastBox(forecast: WeatherDatum) {
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
      background: infoBoxColor
    }).appendTo(container);
    this.createTimeText(forecast.date).appendTo(forecastBox);
    this.createWeatherText(forecast.weatherDetailed).appendTo(forecastBox);
    this.createTemperatureText(forecast.temperature).appendTo(forecastBox);
    this.createWeatherIcon(forecast.weatherIcon).appendTo(forecastBox);
    return container;
  }

  private createTimeText(date: Date) {
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

  private createWeatherText(text: string) {
    return new tabris.TextView({
      centerY: 0,
      left: "prev() 10",
      text: text,
      textColor: textColor,
      font: smallFontItalic
    });
  }

  private createTemperatureText(temperature: number) {
    return new tabris.TextView({
      right: margin,
      centerY: 0,
      text: Math.round(temperature) + "°C",
      textColor: textColor,
      font: bigFont
    });
  }

  private createWeatherIcon(icon: string) {
    return new tabris.ImageView({
      right: 60,
      width: weatherIconSize,
      height: weatherIconSize,
      centerY: 0,
      image: "/icons/" + icon + ".png"
    });
  }

}
