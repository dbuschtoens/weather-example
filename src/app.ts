/// <reference path="../node_modules/tabris/tabris.d.ts"/>
import {WeatherDatum, WeatherData, pollWeatherData} from "./weatherService";
import forcastScroll from "./forcastScroll";

tabris.ui.set("toolbarVisible", false);

let page = new tabris.Page({
  title: "Weather Forcast",
  topLevel: true,
});
let background = new tabris.ImageView({
  centerX: 0, top: 0,
  image: "/images/cloudy.jpg",
  scaleMode: "fill",
  height: tabris.device.get("screenHeight")
}).appendTo(page);
let scroll = new tabris.ScrollView({
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
});
scroll.appendTo(page);
let activityIndicator = new tabris.ActivityIndicator({ centerX: 0, centerY: 0 }).appendTo(scroll);

pollWeatherData("Karlsruhe").then(function(data) {
  activityIndicator.dispose();
  drawApp(data);
}).catch((error) => {
  activityIndicator.dispose();
  console.log(error);
});

function drawApp(data: WeatherData) {
  new forcastScroll(data, {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }).appendTo(scroll);
}

page.open();
