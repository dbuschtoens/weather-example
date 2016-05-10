"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var tabris_1 = require("tabris");
var textColor = "rgb(255, 255, 255)";
var margin = 8;
var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var smallFont = "thin 19px sans-serif";
var smallFontItalic = "italic thin 19px sans-serif";
var bigFont = "thin 28px sans-serif";
var font = "thin 100px sans-serif";
var iconSize = 100;
var CurrentWeatherView = (function (_super) {
    __extends(CurrentWeatherView, _super);
    function CurrentWeatherView(properties) {
        _super.call(this, properties);
        var data = properties.data;
        var centerBox = new tabris_1.Composite({ top: 0, centerX: 0 }).appendTo(this);
        this.createWeatherIcon(data.list[0].weatherIcon).appendTo(centerBox);
        this.createTemperatureText(Math.round(data.list[0].temperature)).appendTo(centerBox);
        this.createWeatherText(data.list[0].weatherDetailed).appendTo(this);
    }
    CurrentWeatherView.prototype.createWeatherIcon = function (icon) {
        return new tabris_1.ImageView({
            centerY: 0,
            width: iconSize,
            height: iconSize,
            scaleMode: "stretch",
            image: "/icons/" + icon + "Big.png"
        });
    };
    CurrentWeatherView.prototype.createTemperatureText = function (temperature) {
        return new tabris_1.TextView({
            centerY: 0,
            left: "prev()",
            text: Math.round(temperature) + "°C",
            textColor: textColor,
            font: font
        });
    };
    CurrentWeatherView.prototype.createWeatherText = function (text) {
        return new tabris_1.TextView({
            top: "prev()",
            centerX: 0,
            text: text,
            textColor: textColor,
            font: bigFont
        });
    };
    return CurrentWeatherView;
}(tabris_1.Composite));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CurrentWeatherView;
