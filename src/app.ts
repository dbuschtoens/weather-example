/// <reference path="../typings/browser.d.ts" />
import {WeatherDatum, WeatherData, pollWeatherData} from "./weatherService";
import ForecastScrollView from "./forecastScrollView";
import CurrentWeatherView from "./currentWeatherView";
import Overview from "./forecastOverview";
import Graph from "./weatherGraph";
import BackgroundLayer from "./backgroundLayer";

tabris.ui.set("toolbarVisible", false);

let page = new tabris.Page({
  title: "Weather Forecast",
  topLevel: true,
  background: "rgb(74, 92, 151)"
});

let scrollView = new tabris.ScrollView({
  left: 0,
  top: 0,
  right: 0,
  // width: tabris.device.get("screenWidth"),
  background: "rgb(83,100,160)"
}).appendTo(page);
let background = new BackgroundLayer({
  top: 0,
  left: 0,
  right: 0,
  height: 1210
}).appendTo(scrollView);
scrollView.on("scroll", (widget, offset) => {
  background.scroll((<{ x: number, y: number }>offset).y);
});

let citySelector = createCitySelector().appendTo(scrollView);
if (localStorage.getItem("city")) {
  loadDataFromInput(citySelector, localStorage.getItem("city"));
}
let currentWeatherInformation: tabris.Composite;

function drawNewCity(data: WeatherData) {
  tabris.device.off();
  if (currentWeatherInformation && !currentWeatherInformation.isDisposed()) currentWeatherInformation.dispose();
  currentWeatherInformation = createWeatherInformation(data);
  background.generateNewClouds();
}

function createWeatherInformation(data: WeatherData) {
  let weatherInformationComposite = new tabris.Composite({
    top: "prev()",
    left: 0,
    width: tabris.device.get("screenWidth")
  }).appendTo(scrollView);
  let currentWeatherView = new CurrentWeatherView({
    data: data,
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  }).appendTo(weatherInformationComposite);
  let overview = new Overview({
    data: data,
    top: "prev()",
    left: 0,
    right: 0,
  }).appendTo(weatherInformationComposite);
  let graph = new Graph({
    data: data,
    top: "prev()",
    right: 0,
    height: tabris.device.get("screenHeight") / 3 - 20,
    width: tabris.device.get("screenWidth"),
  }).appendTo(weatherInformationComposite);
  let forecastScrollView = new ForecastScrollView({
    data: data,
    top: "prev() 4",
    left: 0,
  }).on("change:selection", (widget, selection) => {
    let thisView = <ForecastScrollView>widget;
    let day = thisView.getTabIndex(selection);
    if (day === 0) {
      setTimeout(() => animateGraphChange(graph, data.list[0].date.getTime(), data.list[data.list.length - 1].date.getTime()));
    } else {
      let time = data.days[day][0].date.getTime();
      let newMin = new Date(time);
      let newMax = new Date(time + 24 * 60 * 60 * 1000);
      setTimeout(() => animateGraphChange(graph, newMin.setHours(0, 0, 0, 0), newMax.setHours(0, 0, 0, 0)), 0);
    }
  }).appendTo(weatherInformationComposite);

  tabris.device.on("change:orientation", (device, orientation) => {
    switch (orientation) {
      case "portrait-primary":
      case "portrait-secondary":
        weatherInformationComposite.set("width", tabris.device.get("screenWidth"));
        graph.set("top", "prev()");
        graph.appendTo(scrollView);
        graph.set("width", tabris.device.get("screenWidth"));
        graph.set("height", tabris.device.get("screenHeight") / 3 - 20);
        forecastScrollView.appendTo(scrollView);
        graph.nightColor = "rgba(103,113,145,0.392)";
        graph.dayColor = "rgba(131,156,188,0.286)";
        graph.draw();
        break;
      case "landscape-primary":
      case "landscape-secondary":
        weatherInformationComposite.set("width", tabris.device.get("screenWidth") * 0.55);
        graph.set("top", 40);
        graph.appendTo(page);
        graph.set("width", tabris.device.get("screenWidth") * 0.45);
        graph.set("height", tabris.device.get("screenHeight") - 75);
        graph.nightColor = "rgba(103,113,145,0.835)";
        graph.dayColor = "rgba(131,156,188,0.741)";
        graph.draw();
        break;
    }
    background.generateNewClouds();
  });
  return weatherInformationComposite;
}

function animateGraphChange(graph: Graph, min: number, max: number) {
  graph.animate({ opacity: 0 }, { duration: 180, easing: "ease-in-out" });
  graph.once("animationend", () => {
    graph.setScale(min, max);
    graph.animate({ opacity: 1 }, { duration: 180, easing: "ease-in-out" });
  });
}

function createCitySelector() {
  return new tabris.TextInput({
    top: 0,
    centerX: 0,
    message: "enter city",
    textColor: "#FFFFFF",
    font: "normal thin 32px sans-serif"
  }).on("focus", (widget) => widget.set("text", "")
    ).on("blur", (widget) => widget.set("text", localStorage.getItem("city") || "")
    ).on("accept", loadDataFromInput);
}

function loadDataFromInput(widget: tabris.TextInput, text: string) {
  let activityIndicator = new tabris.ActivityIndicator({ centerX: 0, centerY: 0 }).appendTo(page);
  pollWeatherData(text)
    .then((data) => {
      widget.set("text", data.cityName + ", " + data.countryName);
      localStorage.setItem("city", data.cityName + ", " + data.countryName);
      drawNewCity(data);
    }).catch((error) => {
      console.error(error);
      widget.set("text", "");
      localStorage.setItem("city", "");
    }).then(() => activityIndicator.dispose());
}

page.open();
