"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var tabris_1 = require("tabris");
var textColor = "rgb(255, 255, 255)";
var headerTextColor = "rgb(255, 255, 255)";
var infoBoxColor = "rgba(0, 0, 0, 0.2)";
var headerBoxColor = "rgba(0,0,0,0.4)";
var margin = 5;
var innerMargin = 6;
var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var smallFont = "thin 19px sans-serif";
var smallFontItalic = "italic thin 19px sans-serif";
var bigFont = "thin 28px sans-serif";
var headerHeight = 50;
var forecastBoxHeight = 45;
var weatherIconSize = 35;
var navigationIconSize = 50;
var ForecastTabView = (function (_super) {
    __extends(ForecastTabView, _super);
    function ForecastTabView(properties) {
        properties.tabBarLocation = "hidden";
        properties.paging = true;
        _super.call(this, properties);
        this.data = properties.data;
        this.tabs = [this.createTab(0, "today")];
        this.append(this.tabs[0]);
        for (var index = 1; index < this.data.days.length; index++) {
            var headerName = dayNames[this.data.days[index][0].date.getDay()];
            this.tabs.push(this.createTab(index, headerName));
            this.append(this.tabs[index]);
        }
    }
    ForecastTabView.prototype.getTabIndex = function (tab) {
        return this.tabs.indexOf(tab);
    };
    ForecastTabView.prototype.getTab = function (index) {
        return this.tabs[index];
    };
    ForecastTabView.prototype.createTab = function (dayIndex, text) {
        var tab = new tabris_1.Tab();
        this.createHeader(text, dayIndex).appendTo(tab);
        for (var _i = 0, _a = this.data.days[dayIndex]; _i < _a.length; _i++) {
            var forecast = _a[_i];
            this.createForecastBox(forecast).appendTo(tab);
        }
        return tab;
    };
    ForecastTabView.prototype.createHeader = function (text, tabIndex) {
        var container = new tabris_1.Composite({ top: 0, left: 0, right: 0, height: headerHeight, });
        var background = new tabris_1.Composite({ top: 0, left: margin, right: margin, background: headerBoxColor })
            .appendTo(container);
        new tabris_1.TextView({ text: text, centerY: 0, centerX: 0, font: bigFont, textColor: headerTextColor })
            .appendTo(background);
        if (tabIndex !== 0) {
            this.createArrowImage("left").appendTo(background);
        }
        if (tabIndex !== this.data.days.length - 1) {
            this.createArrowImage("right").appendTo(background);
        }
        return container;
    };
    ForecastTabView.prototype.createArrowImage = function (direction) {
        var _this = this;
        return new tabris_1.ImageView({
            image: "./icons/arrow" + direction + ".png",
            centerY: 0,
            height: 50,
            opacity: 0.6,
            highlightOnTouch: true
        }).set(direction, 0).on("tap", function () {
            var nextTab = _this.tabs[_this.getTabIndex(_this.get("selection")) + ((direction === "right") ? 1 : -1)];
            _this.set("selection", nextTab);
        });
    };
    ForecastTabView.prototype.createForecastBox = function (forecast) {
        var container = new tabris_1.Composite({
            top: "prev()",
            left: 0,
            right: 0,
            height: forecastBoxHeight
        });
        var forecastBox = new tabris_1.Composite({
            top: margin,
            left: margin,
            right: margin,
            background: infoBoxColor
        }).appendTo(container);
        this.createTimeText(forecast.date).appendTo(forecastBox);
        this.createWeatherText(forecast.weatherDetailed).appendTo(forecastBox);
        this.createTemperatureText(forecast.temperature).appendTo(forecastBox);
        this.createWeatherIcon(forecast.weatherIcon).appendTo(forecastBox);
        return container;
    };
    ForecastTabView.prototype.createTimeText = function (date) {
        var minutes = date.getMinutes();
        var hours = date.getHours();
        var hoursString = (hours < 10) ? "0" + hours : hours;
        var minutesString = (minutes < 10) ? "0" + minutes : minutes;
        return new tabris_1.TextView({
            top: innerMargin,
            bottom: innerMargin,
            left: innerMargin,
            text: hoursString + ":" + minutesString,
            textColor: textColor,
            font: smallFont
        });
    };
    ForecastTabView.prototype.createWeatherText = function (text) {
        return new tabris_1.TextView({
            centerY: 0,
            left: "prev() 10",
            text: text,
            textColor: textColor,
            font: smallFontItalic
        });
    };
    ForecastTabView.prototype.createTemperatureText = function (temperature) {
        return new tabris_1.TextView({
            right: margin,
            centerY: 0,
            text: Math.round(temperature) + "°C",
            textColor: textColor,
            font: bigFont
        });
    };
    ForecastTabView.prototype.createWeatherIcon = function (icon) {
        return new tabris_1.ImageView({
            right: 80,
            width: weatherIconSize,
            height: weatherIconSize,
            centerY: 0,
            image: "/icons/" + icon + ".png"
        });
    };
    return ForecastTabView;
}(tabris_1.TabFolder));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ForecastTabView;
