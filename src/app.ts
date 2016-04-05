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

let scrollView = new tabris.ScrollView({
  left: 0,
  top: 0,
  width: tabris.device.get("screenWidth")
}).appendTo(page);

createCitySelector().appendTo(scrollView);
let currentWeatherInformation: tabris.Composite;
let currentCityName = "";
 pollWeatherData("Karlsruhe").then(drawNewCity);

function drawNewCity(data: WeatherData) {
  if (currentWeatherInformation && !currentWeatherInformation.isDisposed()) currentWeatherInformation.dispose();
  currentWeatherInformation = createWeatherInformation(data)
}

function createWeatherInformation(data: WeatherData) {
  let weatherInformationComposite = new tabris.Composite({
    top: "prev()",
    left: 0,
    right: 0,
    bottom: 0,
    // background: "rgba(0,0,255,0.5)"
  }).appendTo(scrollView);
  let currentWeatherView = new CurrentWeatherView({
    data: data,
    top: 0,
    left: 0,
    right: 0,
    background: "red"
  })
  let forecastScrollView = new ForecastScrollView({
    data: data,
    top: "prev()",
    left: 0,
    right: 0,
  //  background: "rgba(255,0,0,0.5)"
  }).appendTo(weatherInformationComposite);
  let graph = new Graph({
    data: data,
    top: "prev()",
    right: 0,
    height: tabris.device.get("screenHeight") / 3,
    width: tabris.device.get("screenWidth"),
  //  background: "rgba(0,255,0,0.5)"
  }).appendTo(weatherInformationComposite);

  /*tabris.device.on("change:orientation", (device, orientation) => {
    switch (orientation) {
      case "portrait-primary":
      case "portrait-secondary":
        graph.set({
          width: tabris.device.get("screenWidth"),
          height: tabris.device.get("screenHeight") / 3
        });
        forecastScrollView.set({ top: "prev()", left: 0, right: 0, bottom: 0 });
        graph.draw();
        break;
      case "landscape-primary":
      case "landscape-secondary":
        graph.set({
          width: (tabris.device.get("screenWidth") / 2),
          height: tabris.device.get("screenHeight")
        });
        forecastScrollView.set({ top: 0, left: 0, bottom: 0, right: undefined, width: (tabris.device.get("screenWidth") / 2) });
        graph.draw();
        break;
    }
  });*/
  console.log("totalbounds after scroll: " + JSON.stringify(weatherInformationComposite.get("bounds")));
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
  }).on("focus", (widget) => widget.set("text", "")
    ).on("blur", (widget) => widget.set("text", currentCityName)
    ).on("accept", (widget, text) => {
      let activityIndicator = new tabris.ActivityIndicator({ centerX: 0, centerY: 0 }).appendTo(page);
      pollWeatherData(text)
        .then((data) => {
          currentCityName = data.cityName + ", " + data.countryName;
          widget.set("text", currentCityName);
          drawNewCity(data)
        }).catch((error) => {
          console.error(error);
          widget.set("text", "");
        }).then(() => activityIndicator.dispose());
    });
}

page.open();
