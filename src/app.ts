import {WeatherDatum, WeatherData, pollWeatherData} from "./weatherService";
import ForecastTabView from "./forecastTabView";
import CurrentWeatherView from "./currentWeatherView";
import Overview from "./forecastOverview";
import Graph from "./weatherGraph";
import BackgroundLayer from "./backgroundLayer";

tabris.ui.set("toolbarVisible", false);

let page = new tabris.Page({
  title: "Weather Forecast",
  topLevel: true,
});

let scrollView = new tabris.ScrollView({
  left: 0,
  top: 0,
  right: 0,
  background: "rgb(83,100,160)"
}).appendTo(page);
let background = new BackgroundLayer({
  top: 0,
  left: 0,
  right: 0,
  height: 1210
}).appendTo(scrollView);

let citySelector = createCitySelector().appendTo(scrollView);

scrollView.on("scroll", (widget, offset) => {
  background.scroll((<{ x: number, y: number }>offset).y);
  citySelector.set("transform", { translationY: (<{ x: number, y: number }>offset).y * 0.6 });
});

if (localStorage.getItem("city")) {
  loadDataFromInput(citySelector, localStorage.getItem("city"));
}

function drawNewCity(data: WeatherData) {
  tabris.device.off();
  page.find(".weatherInfo").dispose();
  createWeatherInformation(data);
  layoutUI();
  background.generateNewClouds();
  tabris.device.on("change:orientation", (device, orientation) => {
    layoutUI();
    background.generateNewClouds();
  });
}


function createWeatherInformation(data: WeatherData) {
  // TODO: make widget creation one-lines SOMEHOW
  let currentWeatherView = new CurrentWeatherView({
    data: data,
    class: "weatherInfo",
    id: "current",
    top: 0,
    left: 0,
    right: 0,
    height: 200
  }).appendTo(page)
  let overview = new Overview({
    class: "weatherInfo",
    id: "overview",
    data: data,
    top: "prev()",
    left: 0,
    right: 0
  }).appendTo(page);
  let graph = new Graph({
    data: data,
    class: "weatherInfo",
    id: "graph",
    top: "prev()",
    right: 0,
    height: tabris.device.get("screenHeight") / 3 - 20,
    width: tabris.device.get("screenWidth")
  }).appendTo(page);
  let forecastTabView = new ForecastTabView({
    data: data,
    class: "weatherInfo",
    id: "forecast",
    top: "prev() 4",
    left: 0
  }).on("change:selection", (widget, selection) => {
    let day = (<ForecastTabView>widget).getTabIndex(selection);
    if (day === 0) {
      animateGraphChange(graph, data.list[0].date.getTime(), data.list[data.list.length - 1].date.getTime());
    } else {
      let time = data.days[day][0].date.getTime();
      let newMin = new Date(time);
      let newMax = new Date(time + 24 * 60 * 60 * 1000);
      animateGraphChange(graph, newMin.setHours(0, 0, 0, 0), newMax.setHours(0, 0, 0, 0));
    }
  }).appendTo(page);
}

function layoutUI() {
  let orientation = tabris.device.get("orientation");
  let landscape = (orientation === "landscape-primary" || orientation === "landscape-secondary");
  let composite = new tabris.Composite({ // Not here
    top: "prev()",
    left: 0,
    width: landscape ? tabris.device.get("screenWidth") * 0.55 : tabris.device.get("screenWidth"),
    class: "weatherInfo"
  }).appendTo(scrollView);
  // TODO: use apply if possible
  page.apply
  page.find("#current").set("LayoutData", { top: 0, left: 0, right: 0, height: 200 }).appendTo(composite);
  page.find("#overview").set("LayoutData", { top: "prev()", left: 0, right: 0 }).appendTo(composite);
  let graph = page.find("#graph")[0];
  if (landscape) {
    // TODO: use device.screenXXX if possible
    // do not repeat "graph" (use apply?)
    graph.set("top", 40)
    graph.set("width", tabris.device.get("screenWidth") * 0.45);
    graph.set("height", tabris.device.get("screenHeight") - 75);
    graph.appendTo(page);
  } else {
    graph.set("top", "prev()");
    graph.set("width", tabris.device.get("screenWidth"));
    graph.set("height", tabris.device.get("screenHeight") / 3 - 20);
    graph.appendTo(composite);
  }
  graph.draw();
  page.find("#forecast").set("LayoutData", { top: 0, left: 0, right: 0, height: 200 }).appendTo(composite);
}

function createCitySelector() {
  return new tabris.TextInput({
    top: 0,
    centerX: 0,
    message: "enter city",
    textColor: "#FFFFFF",
    background: "rgba(255, 255, 255, 0.8)",
    font: "normal thin 32px sans-serif"
  }).on("focus", (widget) => widget.set("text", ""))
    .on("blur", (widget) => widget.set("text", localStorage.getItem("city") || ""))
    .on("accept", loadDataFromInput);
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

function animateGraphChange(graph: Graph, min: number, max: number) {
  graph.animate({ opacity: 0 }, { duration: 180, easing: "ease-in-out" });
  graph.once("animationend", () => {
    graph.setScale(min, max);
    graph.animate({ opacity: 1 }, { duration: 180, easing: "ease-in-out" });
  });
}


page.open();
