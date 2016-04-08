import {WeatherData, WeatherDatum} from "./weatherService";
const textColor = "rgb(255, 255, 255)";
const minTempColor = "rgb(245, 245, 255)";
const infoBoxColor = "rgba(0, 0, 0, 0.2)";

const margin = 5;
const innerMargin = 6;
const daysAbbreviations = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const smallFont = "thin 19px sans-serif";
const bigFont = "thin 28px sans-serif";
const smallFontItalic = "italic thin 22px sans-serif";

interface ForecastOverviewProperties extends tabris.CompositeProperties {
  data: WeatherData;
}

export default class ForecastOverview extends tabris.Composite {

  constructor(properties: ForecastOverviewProperties) {
    properties.class = "weatherInfo";
    properties.id = "overview";
    super(properties);
    let data = properties.data;
    this.createDayInformationBox(data.days[0]).set("top", 0).appendTo(this);
    for (let index = 1; index < data.days.length; index++) {
      this.createDayInformationBox(data.days[index]).appendTo(this);
    }
  }

  // TODO: ser parent here instead of returning child
  private createDayInformationBox(dayForecasts: WeatherDatum[]) {
    let container = new tabris.Composite({
      top: "prev()",
      left: margin,
      right: margin,
    });
    let infoBox = <tabris.Composite>new tabris.Composite({
      top: margin,
      left: margin,
      right: margin,
      background: infoBoxColor
    }).appendTo(container);
    let minTemp = Math.min(...dayForecasts.map((forecast) => forecast.temperature));
    let maxTemp = Math.max(...dayForecasts.map((forecast) => forecast.temperature));
    this.createDayText(dayForecasts[0]).appendTo(infoBox);
    this.createWeatherText(WeatherData.getAverageWeatherDescription(dayForecasts)).appendTo(infoBox);
    this.createTemperatureRangeText(maxTemp, minTemp).appendTo(infoBox);
    return container;
  }

  private createDayText(forecast: WeatherDatum) {
    return new tabris.TextView({
      top: innerMargin,
      bottom: innerMargin,
      left: innerMargin,
      text: daysAbbreviations[forecast.date.getDay()],
      textColor: textColor,
      font: bigFont
    });
  }

  private createTemperatureRangeText(maxTemp: number, minTemp: number) {
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
      textColor: minTempColor,
      baseline: maxTempText,
      font: smallFont
    }).appendTo(container);
    return container;
  }

  private createWeatherText(text: string) {
    return new tabris.TextView({
      left: "prev() 8",
      centerY: 0,
      text: text,
      textColor: textColor,
      font: smallFontItalic
    });
  }

}
