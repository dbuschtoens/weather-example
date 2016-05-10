"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var tabris_1 = require("tabris");
var daysNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var uiFont = "16px sans-serif";
var uiLineColor = "rgba(255,255,255,0.3)";
var uiTextColor = "rgba(0,0,0,0.4)";
var graphLineColor = "rgba(255,255,255,0.55)";
var uiLineWidth = 1.5;
var graphLineWidth = 1;
var minHorizontalDistance = 33;
var minVerticalDistance = 25;
var hourLength = 60 * 60 * 1000;
var dayLength = 24 * 60 * 60 * 1000;
var margins = { top: 20, left: 30, bottom: 13, right: 10 };
var maxZoom = 5;
var nightColor = "rgba(103,113,145,0.392)";
var dayColor = "rgba(131,156,188,0.286)";
var WeatherGraph = (function (_super) {
    __extends(WeatherGraph, _super);
    function WeatherGraph(properties) {
        var _this = this;
        _super.call(this, properties);
        this.width = 0;
        this.height = 0;
        this.data = properties.data;
        this.scale = {
            minX: this.data.list[0].date.getTime(),
            maxX: this.data.list[this.data.list.length - 1].date.getTime(),
            minY: 0,
            maxY: 0
        };
        this.initDataPoints();
        this.initScale();
        this.canvas = new tabris_1.Canvas({ top: 0, left: 0, right: 0, bottom: 0 });
        this.on("resize", function (widget, bounds, options) {
            _this.height = bounds.height;
            _this.width = bounds.width;
            _this.draw();
        });
    }
    WeatherGraph.prototype.setScale = function (newMin, newMax) {
        _a = [newMin, newMax], this.scale.minX = _a[0], this.scale.maxX = _a[1];
        this.initDataPoints();
        this.initScale();
        this.draw();
        var _a;
    };
    WeatherGraph.prototype.draw = function () {
        var ctx = this.getContext("2d", this.width, this.height);
        this.drawBackground(ctx);
        this.drawTemperatureScale(ctx);
        this.drawTimeScale(ctx);
        this.drawTemperatureCurve(ctx);
    };
    WeatherGraph.prototype.initDataPoints = function () {
        var _this = this;
        this.dataPoints = this.data.list.filter(function (datum) {
            return (datum.date.getTime() > _this.scale.minX && datum.date.getTime() < _this.scale.maxX);
        });
        var firstIndex = this.data.list.indexOf(this.dataPoints[0]);
        var lastIndex = this.data.list.indexOf(this.dataPoints[this.dataPoints.length - 1]);
        if (firstIndex > 0) {
            this.dataPoints.unshift(this.data.getWeatherAtDate(new Date(this.scale.minX)));
        }
        if (lastIndex < this.data.list.length - 1) {
            this.dataPoints.push(this.data.getWeatherAtDate(new Date(this.scale.maxX)));
        }
    };
    WeatherGraph.prototype.initScale = function () {
        var temperatures = this.dataPoints.map(function (forcast) { return forcast.temperature; });
        var _a = [Math.min.apply(Math, temperatures), Math.max.apply(Math, temperatures)], minTemp = _a[0], maxTemp = _a[1];
        var meanTemp = (maxTemp + minTemp) / 2;
        var tempScaleFactor = 1.2;
        this.scale.minY = meanTemp + tempScaleFactor * (minTemp - meanTemp);
        this.scale.maxY = meanTemp + tempScaleFactor * (maxTemp - meanTemp);
    };
    WeatherGraph.prototype.drawBackground = function (ctx) {
        var now = this.scale.minX;
        var dayOffset = new Date(now).getDate() - this.data.list[0].date.getDate();
        var sunriseTime = this.data.sunriseTime.getTime() + dayOffset * dayLength;
        var sunsetTime = this.data.sunsetTime.getTime() + dayOffset * dayLength;
        var isDay = (sunriseTime < now && now < sunsetTime);
        sunriseTime += (now > sunriseTime) ? dayLength : 0;
        sunsetTime += (now > sunsetTime) ? dayLength : 0;
        var startTime = Math.min(sunriseTime, sunsetTime);
        var endTime = Math.max(sunriseTime, sunsetTime);
        this.drawArea(ctx, now, startTime, isDay ? dayColor : nightColor);
        isDay = !isDay;
        while (endTime < this.scale.maxX) {
            this.drawArea(ctx, startTime, endTime, isDay ? dayColor : nightColor);
            isDay = !isDay;
            _a = [endTime, startTime + dayLength], startTime = _a[0], endTime = _a[1];
        }
        this.drawArea(ctx, startTime, this.scale.maxX, isDay ? dayColor : nightColor);
        var _a;
    };
    WeatherGraph.prototype.drawArea = function (ctx, startTime, endTime, color) {
        ctx.fillStyle = color;
        var graphHeight = this.get("height") - margins.top - margins.bottom;
        ctx.fillRect(this.getX(startTime), this.getY(this.scale.maxY), this.getX(endTime) - this.getX(startTime), graphHeight);
    };
    ;
    WeatherGraph.prototype.drawTemperatureScale = function (ctx) {
        var degreeHeight = this.getY(this.scale.minY) - this.getY(this.scale.minY + 1);
        var degreeStep = (degreeHeight > minVerticalDistance) ? 1 : (2 * degreeHeight > minVerticalDistance) ? 2 : 5;
        var minHeight = Math.ceil(this.scale.minY / degreeStep) * degreeStep;
        ctx.strokeStyle = uiLineColor;
        ctx.lineWidth = uiLineWidth;
        for (var height = minHeight; height < this.scale.maxY; height += degreeStep) {
            // horizontal line
            ctx.beginPath();
            ctx.moveTo(this.getX(this.scale.minX), this.getY(height));
            ctx.lineTo(this.getX(this.scale.maxX), this.getY(height));
            ctx.stroke();
            // text label
            ctx.fillStyle = uiTextColor;
            ctx.font = uiFont;
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.fillText(height + "°C", this.getX(this.scale.minX) - 2, this.getY(height));
        }
    };
    WeatherGraph.prototype.drawTimeScale = function (ctx) {
        ctx.strokeStyle = uiLineColor;
        ctx.lineWidth = uiLineWidth;
        ctx.fillStyle = uiTextColor;
        ctx.font = uiFont;
        var minDay = new Date(this.scale.minX).setHours(0, 0, 0, 0);
        minDay += (minDay === this.scale.minX) ? 0 : dayLength;
        for (var day = minDay; day < this.scale.maxX; day += dayLength) {
            this.drawVerticalLine(ctx, day, 12);
            this.drawDayLabel(ctx, day);
        }
        var hourWidth = this.getX(this.scale.minX + hourLength) - this.getX(this.scale.minX);
        var hourStep = (2 * hourWidth > minHorizontalDistance) ? 2
            : (6 * hourWidth > minHorizontalDistance) ? 6 : undefined;
        if (hourStep) {
            var minHour = Math.ceil((new Date(this.scale.minX).getHours() + 1) / hourStep) * hourStep;
            var hour = new Date(this.scale.minX).setHours(minHour, 0, 0, 0);
            for (; hour < this.scale.maxX; hour += hourStep * hourLength) {
                this.drawVerticalLine(ctx, hour, 0);
                this.drawHourLabel(ctx, hour);
            }
        }
    };
    WeatherGraph.prototype.drawVerticalLine = function (ctx, time, extraLength) {
        ctx.beginPath();
        ctx.moveTo(this.getX(time), this.getY(this.scale.minY));
        ctx.lineTo(this.getX(time), this.getY(this.scale.maxY) - extraLength);
        ctx.stroke();
    };
    WeatherGraph.prototype.drawDayLabel = function (ctx, day) {
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        var dayName = daysNames[new Date(day).getDay()];
        ctx.fillText(dayName, this.getX(day) + 3, this.getY(this.scale.maxY) + 1);
    };
    WeatherGraph.prototype.drawHourLabel = function (ctx, hour) {
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        var hourNumber = new Date(hour).getHours();
        var hourString = (hourNumber < 10) ? "0" + hourNumber + ":00" : hourNumber + ":00";
        ctx.fillText(hourString, this.getX(hour), this.getY(this.scale.minY) + 1);
    };
    WeatherGraph.prototype.drawTemperatureCurve = function (ctx) {
        var points = this.dataPoints.map(function (forecast) { return ({ x: forecast.date.getTime(), y: forecast.temperature }); });
        for (var i = 1; i < points.length - 1; i++) {
            points[i].dydx = this.estimateDerivative(points[i - 1], points[i], points[i + 1]);
        }
        var n = points.length - 1;
        points[0].dydx = (points[1].y - points[0].y) / (points[1].x - points[0].x);
        points[n].dydx = (points[n].y - points[n - 1].y) / (points[n].x - points[n - 1].x);
        for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
            var point = points_1[_i];
            this.drawPoint(ctx, point);
        }
        this.drawHermiteInterpolation(ctx, points);
    };
    WeatherGraph.prototype.estimateDerivative = function (prev, point, next) {
        if ((prev.y > point.y && next.y > point.y) || (prev.y < point.y && next.y < point.y)) {
            return 0;
        }
        else {
            return (next.y - prev.y) / (next.x - prev.x);
        }
    };
    WeatherGraph.prototype.drawHermiteInterpolation = function (ctx, points) {
        ctx.strokeStyle = graphLineColor;
        ctx.lineWidth = graphLineWidth;
        for (var i = 0; i < points.length - 1; i++) {
            ctx.beginPath();
            var _a = [points[i], points[i + 1]], b0 = _a[0], b3 = _a[1];
            var h = (b3.x - b0.x) / 3;
            var b1 = { x: b0.x + h, y: b0.y + (h * b0.dydx) };
            var b2 = { x: b3.x - h, y: b3.y - (h * b3.dydx) };
            ctx.moveTo(this.getX(b0.x), this.getY(b0.y));
            ctx.bezierCurveTo(this.getX(b1.x), this.getY(b1.y), this.getX(b2.x), this.getY(b2.y), this.getX(b3.x), this.getY(b3.y));
            ctx.stroke();
        }
    };
    WeatherGraph.prototype.drawPoint = function (ctx, point) {
        ctx.fillStyle = graphLineColor;
        ctx.fillRect(this.getX(point.x) - 2, this.getY(point.y) - 2, 4, 4);
    };
    WeatherGraph.prototype.getX = function (time) {
        var graphWidth = this.width - margins.left - margins.right;
        var ratio = (time - this.scale.minX) / (this.scale.maxX - this.scale.minX);
        return margins.left + (graphWidth * ratio);
    };
    WeatherGraph.prototype.getY = function (temperature) {
        var graphHeight = this.height - margins.top - margins.bottom;
        var ratio = (temperature - this.scale.minY) / (this.scale.maxY - this.scale.minY);
        return margins.top + graphHeight * (1 - ratio);
    };
    return WeatherGraph;
}(tabris_1.Canvas));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WeatherGraph;
;
