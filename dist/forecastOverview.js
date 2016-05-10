"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var tabris_1 = require("tabris");
var weatherService_1 = require("./weatherService");
var textColor = "rgb(255, 255, 255)";
var minTempColor = "rgb(245, 245, 255)";
var infoBoxColor = "rgba(0, 0, 0, 0.2)";
var margin = 5;
var innerMargin = 6;
var daysAbbreviations = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var smallFont = "thin 19px sans-serif";
var bigFont = "thin 28px sans-serif";
var smallFontItalic = "italic thin 22px sans-serif";
var ForecastOverview = (function (_super) {
    __extends(ForecastOverview, _super);
    function ForecastOverview(properties) {
        _super.call(this, properties);
        this.days = properties.data.days;
        for (var index = 0; index < this.days.length; index++) {
            this.createDayInformationBox(index).appendTo(this);
        }
    }
    ForecastOverview.prototype.createDayInformationBox = function (dayIndex) {
        var _this = this;
        var dayForecasts = this.days[dayIndex];
        var container = new tabris_1.Composite({
            top: this.children().length === 0 ? 0 : "prev()",
            left: margin,
            right: margin,
        });
        var infoBox = new tabris_1.Composite({
            top: margin,
            left: margin,
            right: margin,
            background: infoBoxColor,
            highlightOnTouch: true
        }).on("tap", function () { return _this.trigger("daySelect", dayIndex); }).appendTo(container);
        var minTemp = Math.min.apply(Math, dayForecasts.map(function (forecast) { return forecast.temperature; }));
        var maxTemp = Math.max.apply(Math, dayForecasts.map(function (forecast) { return forecast.temperature; }));
        this.createDayText(dayForecasts[0]).appendTo(infoBox);
        this.createWeatherText(weatherService_1.WeatherData.getAverageWeatherDescription(dayForecasts)).appendTo(infoBox);
        this.createTemperatureRangeText(maxTemp, minTemp).appendTo(infoBox);
        return container;
    };
    ForecastOverview.prototype.createDayText = function (forecast) {
        return new tabris_1.TextView({
            top: innerMargin,
            bottom: innerMargin,
            left: innerMargin,
            text: daysAbbreviations[forecast.date.getDay()],
            textColor: textColor,
            font: bigFont
        });
    };
    ForecastOverview.prototype.createTemperatureRangeText = function (maxTemp, minTemp) {
        var container = new tabris_1.Composite({
            right: margin,
            centerY: 0
        });
        var maxTempText = new tabris_1.TextView({
            text: Math.round(maxTemp) + "°C /",
            textColor: textColor,
            font: bigFont
        }).appendTo(container);
        new tabris_1.TextView({
            left: "prev()",
            text: Math.round(minTemp) + "°C",
            textColor: minTempColor,
            baseline: maxTempText,
            font: smallFont
        }).appendTo(container);
        return container;
    };
    ForecastOverview.prototype.createWeatherText = function (text) {
        return new tabris_1.TextView({
            left: "prev() 8",
            centerY: 0,
            text: text,
            textColor: textColor,
            font: smallFontItalic
        });
    };
    return ForecastOverview;
}(tabris_1.Composite));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ForecastOverview;
