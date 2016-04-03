/// <reference path="../typings/browser.d.ts" />
import {WeatherDatum, WeatherData, pollWeatherData} from "./weatherService";
import ForecastScrollView from "./forecastScrollView";
import CurrentWeatherView from "./currentWeatherView";
import Graph from "./weatherGraph";

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

tabris.device.on("change:orientation", () => {
  console.error("CHAAAANGE");
};
)

createCitySelector().appendTo(scrollView);

function drawNewCity(data: WeatherData) {
  new CurrentWeatherView({
    data: data,
    top: 0,
    left: 0,
    right: 0,
  }).appendTo(scrollView);
  let graph = new Graph({
    data: data,
    top: "prev()",
    left: 0
  }).appendTo(scrollView);
  new tabris.Button({
    top: "prev()",
    text: "<->"
  }).on("select", () => {
    graph.zoom(1.2);
  }).appendTo(scrollView);
  new tabris.Button({
    top: "prev()",
    text: ">-<"
  }).on("select", () => {
    graph.zoom(0.8);
  }).appendTo(scrollView);
  new ForecastScrollView({
    data: data,
    top: "prev()",
    left: 0,
    right: 0,
    bottom: 0
  }).appendTo(scrollView);
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
    centerX: 0,
    message: "enter city"
  }).on("accept", (widget, text) => {
    let activityIndicator = new tabris.ActivityIndicator({ centerX: 0, centerY: 0 }).appendTo(page);
    pollWeatherData(text)
      .then(drawNewCity)
      .then(() => widget.dispose())
      .catch((error) => {
        console.error(error);
        widget.set("text", "");
      }).then(() => activityIndicator.dispose())
  });
}


page.open();
