"use strict";
var weatherService_1 = require("./weatherService");
var forecastTabView_1 = require("./forecastTabView");
var currentWeatherView_1 = require("./currentWeatherView");
var forecastOverview_1 = require("./forecastOverview");
var weatherGraph_1 = require("./weatherGraph");
var backgroundLayer_1 = require("./backgroundLayer");
var tabris_1 = require("tabris");
var page = new tabris_1.Page({
    title: "Weather Forecast",
    topLevel: true,
    background: "rgb(83,100,160)"
}).on("resize", function () { return layoutUI(); }).once("resize", function () { return tabris_1.ui.set("toolbarVisible", false); });
var background = new backgroundLayer_1.default({
    top: 0,
    left: 0,
    right: 0,
}).appendTo(page);
var scrollView = new tabris_1.ScrollView({ id: "scrollView" }).appendTo(page);
var citySelector = createCitySelector().appendTo(scrollView);
scrollView.on("scroll", function (widget, offset) {
    background.scroll(-offset.y);
});
if (localStorage.getItem("city")) {
    loadDataFromInput(citySelector, localStorage.getItem("city"));
}
var finishedLoading = false;
function drawNewCity(data) {
    page.find(".weatherInfo").dispose();
    createWeatherInformation(data);
    layoutUI();
}
function createWeatherInformation(data) {
    var properties = { data: data, class: "weatherInfo" };
    var container = new tabris_1.Composite({ class: "weatherInfo", id: "container" }).on("resize", function (widget, bounds) {
        background.set("height", bounds.height + bounds.top);
    }).appendTo(scrollView);
    var currentWeatherView = new currentWeatherView_1.default(properties).set("id", "current").appendTo(container);
    var graph = new weatherGraph_1.default(properties).set("id", "graph").appendTo(container);
    var forecastTabView = new forecastTabView_1.default(properties).set("id", "forecast")
        .on("change:selection", function (widget, selection) {
        changeGraphFocus(widget, selection, data);
    }).appendTo(container);
    var overview = new forecastOverview_1.default(properties).set("id", "overview").on("daySelect", function (index) {
        forecastTabView.set("selection", forecastTabView.getTab(index));
        var scrollToGraph = container.get("bounds").top + currentWeatherView.get("bounds").height + overview.get("bounds").height;
        var maxScroll = container.get("bounds").top + container.get("bounds").height - page.get("bounds").height;
        scrollView.set("scrollY", Math.min(scrollToGraph, maxScroll));
    }).appendTo(container);
    finishedLoading = true;
}
function changeGraphFocus(forecastTabView, selection, data) {
    var day = forecastTabView.getTabIndex(selection);
    var graph = page.find("#graph")[0];
    if (day === 0) {
        animateGraphChange(graph, data.list[0].date.getTime(), data.list[data.list.length - 1].date.getTime());
    }
    else {
        var time = data.days[day][0].date.getTime();
        var newMin = new Date(time);
        var newMax = new Date(time + 24 * 60 * 60 * 1000);
        animateGraphChange(graph, newMin.setHours(0, 0, 0, 0), newMax.setHours(0, 0, 0, 0));
    }
}
function layoutUI() {
    var bounds = page.get("bounds");
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
    return new tabris_1.TextInput({
        top: 30,
        centerX: 0,
        message: "enter city",
        textColor: "#FFFFFF",
        background: "rgba(255, 255, 255, 0)",
        font: "normal thin 32px sans-serif"
    }).on("focus", function (widget) { return widget.set("text", ""); })
        .on("blur", function (widget) { return widget.set("text", localStorage.getItem("city") || ""); })
        .on("accept", loadDataFromInput);
}
function loadDataFromInput(widget, text) {
    var activityIndicator = new tabris_1.ActivityIndicator({ centerX: 0, centerY: 0 }).appendTo(page);
    weatherService_1.pollWeatherData(text)
        .then(function (data) {
        widget.set("text", data.cityName + ", " + data.countryName);
        localStorage.setItem("city", data.cityName);
        drawNewCity(data);
    }).catch(function (error) {
        console.error(error);
        widget.set("text", "");
        localStorage.setItem("city", "");
    }).then(function () { return activityIndicator.dispose(); });
}
function animateGraphChange(graph, min, max) {
    graph.off("animationend");
    graph.animate({ opacity: 0 }, { duration: 180, easing: "ease-in-out" });
    graph.once("animationend", function () {
        graph.setScale(min, max);
        graph.animate({ opacity: 1 }, { duration: 180, easing: "ease-in-out" });
    });
}
page.open();
