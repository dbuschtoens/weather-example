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

/*let citySelector = new tabris.TextInput({
  top: 0,
  centerX: 0,
  message: "Test",
  font: "bold 32px"
}).on("accept", (widget) => {
  console.error("accept");
}).on("blur", (widget) => {
  console.error("blur");
}).on("change:text", (widget) => {
  console.error("change:text");
}).on("focus", (widget) => {
  console.error("focus");
}).on("input", (widget) => {
  console.error("input");
}).appendTo(scrollView);*/
let citySelector = createCitySelector().appendTo(scrollView)
let currentWeatherInformation: tabris.Composite;


function drawNewCity(data: WeatherData) {
  citySelector.set("text", data.cityName + ", " + data.countryName);
  if (currentWeatherInformation) currentWeatherInformation.dispose();
  currentWeatherInformation = <tabris.Composite>createWeatherInformation(data).appendTo(scrollView);
}

function createWeatherInformation(data: WeatherData) {
  let weatherInformationComposite = new tabris.Composite({
    top: "prev()",
    left: 0,
    right: 0
  })
  new CurrentWeatherView({
    data: data,
    top: 0,
    left: 0,
    right: 0
  }).appendTo(weatherInformationComposite);
  let graph = <Graph>new Graph({
    data: data,
    top: "prev()",
    left: 0
  }).appendTo(weatherInformationComposite);
  new tabris.Button({
    top: "prev()",
    text: "<->"
  }).on("select", () => {
    graph.zoom(1.2);
  }).appendTo(weatherInformationComposite);
  new tabris.Button({
    top: "prev()",
    text: ">-<"
  }).on("select", () => {
    graph.zoom(0.8);
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
    font: "bold 32px"
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

function oldCitySelector() {
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
      }).then(() => activityIndicator.dispose());
  });
}


page.open();
