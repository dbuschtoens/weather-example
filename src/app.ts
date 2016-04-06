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
  width: tabris.device.get("screenWidth"),
  background: "rgb(83,100,160)"
}).appendTo(page);
let background = new BackgroundLayer({
  top: 0,
  left: 0,
  width: 360,
  height: 1210,
  // right: 0,
  // bottom: 0,
  //  background: "rgba(255,0,0,0.1)"
}).appendTo(scrollView);
scrollView.on("scroll", (widget, _offset) => {
  let offset = <{ x: number, y: number }>_offset;
  background.scroll(offset.y);
});



createCitySelector().appendTo(scrollView);
let currentWeatherInformation: tabris.Composite;
let currentCityName = "";
pollWeatherData("Karlsruhe").then(drawNewCity);


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
    right: 0,
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
    right: 0,
  }).on("change:selection", (widget, selection) => {
    let thisView = <ForecastScrollView>widget;
    let day = thisView.getTabIndex(selection);
    if (day === 0) {
      setTimeout(() => animateGraphChange(graph, data.list[0].date, data.list[data.list.length - 1].date));
    } else {
      let time = data.days[day][0].date.getTime();
      let newMin = new Date(time);
      let newMax = new Date(time + 24 * 60 * 60 * 1000);
      newMin.setHours(0, 0, 0, 0);
      newMax.setHours(0, 0, 0, 0);
      setTimeout(() => animateGraphChange(graph, newMin, newMax));
    }
  }).appendTo(weatherInformationComposite);

  tabris.device.on("change:orientation", (device, orientation) => {
    switch (orientation) {
      case "portrait-primary":
      case "portrait-secondary":
        scrollView.set("width", tabris.device.get("screenWidth"));
        graph.set("top", "prev()")
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
        scrollView.set("width", tabris.device.get("screenWidth") / 2);
        graph.set("top", 27);
        graph.appendTo(page);
        graph.set("width", tabris.device.get("screenWidth") / 2);
        graph.set("height", tabris.device.get("screenHeight") - 60);
        graph.nightColor = "rgba(103,113,145,0.835)";
        graph.dayColor = "rgba(131,156,188,0.741)";
        graph.draw();
        break;
    }
    background.generateNewClouds();
  });
  return weatherInformationComposite;
}

function animateGraphChange(graph: Graph, min: Date, max: Date) {
  graph.animate({ opacity: 0 }, { duration: 128, easing: "ease-in" })
  graph.once("animationend", () => {
    graph.setScale(min, max);
    graph.animate({ opacity: 1 }, { duration: 128, easing: "ease-out" });
  });
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
  }).on("focus", (widget) => widget.set("text", "")
    ).on("blur", (widget) => widget.set("text", currentCityName)
    ).on("accept", (widget, text) => {
      let activityIndicator = new tabris.ActivityIndicator({ centerX: 0, centerY: 0 }).appendTo(page);
      pollWeatherData(text)
        .then((data) => {
          currentCityName = data.cityName + ", " + data.countryName;
          widget.set("text", currentCityName);
          drawNewCity(data);
        }).catch((error) => {
          console.error(error);
          widget.set("text", "");
        }).then(() => activityIndicator.dispose());
    });
}

page.open();
