/// <reference path="../typings/browser.d.ts" />
import {WeatherDatum, WeatherData, pollWeatherData} from "./weatherService";
import ForecastScrollView from "./forecastScrollView";
import CurrentWeatherView from "./currentWeatherView";
import Graph from "./weatherGraph";

tabris.ui.set("toolbarVisible", false);

let page = new tabris.Page({
  title: "Weather Forecast",
  topLevel: true,
  background: "rgb(75,115,173)"
});

let citySelector = createCitySelector().appendTo(page)
let currentWeatherInformation: tabris.Composite;

function drawNewCity(data: WeatherData) {
  citySelector.set("text", data.cityName + ", " + data.countryName);
  if (currentWeatherInformation) currentWeatherInformation.dispose();
  currentWeatherInformation = <tabris.Composite>createWeatherInformation(data).appendTo(page);
}

function createWeatherInformation(data: WeatherData) {
  let weatherInformationComposite = new tabris.Composite({
    top: "prev()",
    left: 0,
    right: 0
  });
  let graph = <Graph>new Graph({
    data: data,
    top: "top",
    left: 0
  }).appendTo(weatherInformationComposite);
  new ForecastScrollView({
    data: data,
    top: "prev()",
    left: 0,
    right: 0,
    bottom: 0
  }).appendTo(weatherInformationComposite);
  return weatherInformationComposite;
}

function createBackground() {
  return new tabris.ImageView({
    centerX: 0, top: 0,
    image: "/images/cloudySmall.jpg",
    scaleMode: "fill",
    height: tabris.device.get("screenHeight")
  });
}

function createCitySelector() {
  return new tabris.TextInput({
    top: 0,
    centerX: 0,
    message: "enter city",
    textColor: "#FFFFFF",
    font: "normal thin 32px sans-serif"
  }).on("focus", (widget) => {
    widget.set("text", "");
  }).on("accept", (widget, text) => {
    let activityIndicator = new tabris.ActivityIndicator({ centerX: 0, centerY: 0 }).appendTo(page);
    pollWeatherData(text)
      .then(drawNewCity)
      .catch((error) => {
        console.error(error);
        widget.set("text", "");
      }).then(() => activityIndicator.dispose());
  });
}

page.open();
