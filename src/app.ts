/// <reference path="../node_modules/tabris/tabris.d.ts"/>
import {WeatherDatum, WeatherData, pollWeatherData} from "./weatherService";
import ForecastScrollView from "./forecastScrollView";
import CurrentWeatherView from "./currentWeatherView";

tabris.ui.set("toolbarVisible", false);

let page = new tabris.Page({
  title: "Weather Forecast",
  topLevel: true,
});

createBackground().appendTo(page);

let scrollView = new tabris.ScrollView({
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
});
scrollView.appendTo(page);
let activityIndicator = new tabris.ActivityIndicator({ centerX: 0, centerY: 0 }).appendTo(page);

pollWeatherData("Karlsruhe")
  .then(drawUI)
  .catch((error) => console.error(error))
  .then(() => activityIndicator.dispose());

function drawUI(data: WeatherData) {
  new CurrentWeatherView(data, {
    top: 0,
    left: 0,
    right: 0,
  }).appendTo(scrollView);
  new ForecastScrollView(data, {
    top: "prev()",
    left: 0,
    right: 0,
    bottom: 0
  }).appendTo(scrollView);
}

function createBackground() {
  return new tabris.ImageView({
    centerX: 0, top: 0,
    image: "/images/cloudy.jpg",
    scaleMode: "fill",
    height: tabris.device.get("screenHeight")
  });
}

page.open();
