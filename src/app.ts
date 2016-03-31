/// <reference path="../node_modules/tabris/tabris.d.ts"/>
import {WeatherDatum, WeatherData, pollWeatherData} from "./weatherService";
import ForcastScrollView from "./forcastScrollView";
import CurrentWeatherView from "./currentWeatherView";

tabris.ui.set("toolbarVisible", false);

let page = new tabris.Page({
  title: "Weather Forcast",
  topLevel: true,
});
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
  createBackground().appendTo(page);
  new CurrentWeatherView(data, {
    top: 0,
    left: 0,
    right: 0,
  }).appendTo(scrollView);
  new ForcastScrollView(data, {
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
