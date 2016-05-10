import {WeatherDatum, WeatherData, pollWeatherData} from "./weatherService";
import ForecastTabView from "./forecastTabView";
import CurrentWeatherView from "./currentWeatherView";
import Overview from "./forecastOverview";
import Graph from "./weatherGraph";
import BackgroundLayer from "./backgroundLayer";
import {ui, device, Page, ScrollView, ActivityIndicator, Composite, Tab, TextInput} from "tabris";

let page = new Page({
  title: "Weather Forecast",
  topLevel: true,
  background: "rgb(83,100,160)"
}).on("resize", () => layoutUI()).once("resize", () => ui.set("toolbarVisible", false));

let background = new BackgroundLayer({
  top: 0,
  left: 0,
  right: 0,
}).appendTo(page);
let scrollView = new ScrollView({ id: "scrollView" }).appendTo(page);
let citySelector = createCitySelector().appendTo(scrollView);
scrollView.on("scroll", (widget, offset) => {
  background.scroll(-(<{ x: number, y: number }>offset).y);
});
if (localStorage.getItem("city")) {
  loadDataFromInput(citySelector, localStorage.getItem("city"));
}
let finishedLoading = false;
function drawNewCity(data: WeatherData) {
  page.find(".weatherInfo").dispose();
  createWeatherInformation(data);
  layoutUI();
}

function createWeatherInformation(data: WeatherData) {
  let properties = { data: data, class: "weatherInfo" };
  let container = new Composite({ class: "weatherInfo", id: "container" }).on("resize", (widget, bounds) => {
    background.set("height", bounds.height + bounds.top);
  }).appendTo(scrollView);
  new CurrentWeatherView(properties).set("id", "current").appendTo(container);
  let graph = new Graph(properties).set("id", "graph").appendTo(container);
  let forecastTabView = new ForecastTabView(properties).set("id", "forecast")
    .on("change:selection", (widget, selection) => {
      changeGraphFocus(<ForecastTabView>widget, selection, data);
    }).appendTo(container);
  new Overview(properties).set("id", "overview").on("daySelect", (index) => {
    forecastTabView.set("selection", forecastTabView.getTab(index));
    console.error(index);
  }).appendTo(container);
  finishedLoading = true;
}

function changeGraphFocus(forecastTabView: ForecastTabView, selection: Tab, data: WeatherData) {
  let day = forecastTabView.getTabIndex(selection);
  let graph = page.find("#graph")[0];
  if (day === 0) {
    animateGraphChange(graph, data.list[0].date.getTime(), data.list[data.list.length - 1].date.getTime());
  } else {
    let time = data.days[day][0].date.getTime();
    let newMin = new Date(time);
    let newMax = new Date(time + 24 * 60 * 60 * 1000);
    animateGraphChange(graph, newMin.setHours(0, 0, 0, 0), newMax.setHours(0, 0, 0, 0));
  }
}

function layoutUI() {
  let bounds = page.get("bounds");
  scrollView.set({
    top: 0,
    left: 0,
    bottom: 0,
    width: bounds.width
  });
  if (finishedLoading) {
    page.apply({
      "#container": { top: "prev()", left: 0, right: 0 },
      "#current": { top: 0, left: 0, right: 0, height: 200 },
      "#overview": { top: "#current", left: 0, right: 0 },
      "#graph": { "top": "#overview", "right": 0, "left": 0, "height": 200 },
      "#forecast": { top: ["#graph", 4], left: 0, right: 0, height: 410 }
    });
  }
}

function createCitySelector() {
  return new TextInput({
    top: 30,
    centerX: 0,
    message: "enter city",
    textColor: "#FFFFFF",
    background: "rgba(255, 255, 255, 0)",
    font: "normal thin 32px sans-serif"
  }).on("focus", (widget) => widget.set("text", ""))
    .on("blur", (widget) => widget.set("text", localStorage.getItem("city") || ""))
    .on("accept", loadDataFromInput);
}

function loadDataFromInput(widget: TextInput, text: string) {
  let activityIndicator = new ActivityIndicator({ centerX: 0, centerY: 0 }).appendTo(page);
  pollWeatherData(text)
    .then((data) => {
      widget.set("text", data.cityName + ", " + data.countryName);
      localStorage.setItem("city", data.cityName);
      drawNewCity(data);
    }).catch((error) => {
      console.error(error);
      widget.set("text", "");
      localStorage.setItem("city", "");
    }).then(() => activityIndicator.dispose());
}

function animateGraphChange(graph: Graph, min: number, max: number) {
  graph.off("animationend");
  graph.animate({ opacity: 0 }, { duration: 180, easing: "ease-in-out" });
  graph.once("animationend", () => {
    graph.setScale(min, max);
    graph.animate({ opacity: 1 }, { duration: 180, easing: "ease-in-out" });
  });
}


page.open();
