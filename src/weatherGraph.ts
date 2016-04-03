/// <reference path="../typings/browser.d.ts" />

import {WeatherData} from "./weatherService";

const daysNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const uiFont = "12px sans-serif";
const uiLineColor = "rgba(20,20,20,0.3)";
const uiLineWidth = 2;
const uiTextColor = "rgba(20,20,20,0.5)";
const minHorizontalDistance = 50;
const minVerticalDistance = 50;
const graphLineColor = "rgba(20,20,20,0.7)";
const nightColor = "rgba(0,0,60,0.3)";
const dayColor = "rgba(255,187,69,0.3)";
const lengthHour = 60 * 60 * 1000;
const lengthDay = 24 * 60 * 60 * 1000;
const margins = { top: 20, left: 30, bottom: 10, right: 10 };
const maxZoom = 5;

interface WeatherGraphProperties extends tabris.CanvasProperties {
  data: WeatherData;
}

export default class WeatherGraph extends tabris.Canvas {
  private scale: { minX: number, maxX: number, minY: number, maxY: number };
  private data: WeatherData;

  constructor(properties: WeatherGraphProperties) {
    super(properties);
    this.data = properties.data;
    this.initScale();
    this.setCanvasBounds();
    this.draw();
  }

  public zoom(factor: number) {
    console.error("zoom " + factor);
    let screenWidth = tabris.device.get("screenWidth");
    let currentWidth = this.get("width");
    let newWidth = Math.min(Math.max(screenWidth, currentWidth * factor), maxZoom * screenWidth);
    this.setCanvasBounds(newWidth);
    this.draw();
  }
  private setCanvasBounds(width?: number) {
    let height = tabris.device.get("screenHeight") / 3;
    if (!width) width = tabris.device.get("screenWidth");
    this.set("height", height);
    this.set("width", width);
  }
  private initScale() {
    let minTime = this.data.list[0].date.getTime();
    let maxTime = this.data.list[this.data.list.length - 1].date.getTime();
    let temperatures = this.data.list.map((forcast) => forcast.temperature);
    let maxTemp = Math.max(...temperatures);
    let minTemp = Math.min(...temperatures);
    let meanTemp = (maxTemp + minTemp) / 2;
    let tempScaleFactor = 1.2;
    this.scale = {
      minX: minTime,
      maxX: maxTime,
      minY: meanTemp + tempScaleFactor * (minTemp - meanTemp),
      maxY: meanTemp + tempScaleFactor * (maxTemp - meanTemp)
    };
  }

  private draw() {
    let ctx = <any>this.getContext("2d", this.get("width"), this.get("height"));
    this.drawBackground(ctx);
    this.drawTemperatureScale(ctx);
    this.drawTimeScale(ctx);
    this.drawTemperatureCurve(ctx);
  }

  private drawBackground(ctx: any) {
    let sunriseTime = this.data.sunriseTime.getTime();
    let sunsetTime = this.data.sunsetTime.getTime();
    let now = this.scale.minX;
    let isDay = (sunriseTime < now && now < sunsetTime);
    sunriseTime += (now > sunriseTime) ? lengthDay : 0;
    sunsetTime += (now > sunsetTime) ? lengthDay : 0;
    let startTime = Math.min(sunriseTime, sunsetTime);
    let endTime = Math.max(sunriseTime, sunsetTime);

    this.drawArea(ctx, now, startTime, isDay ? dayColor : nightColor);
    isDay = !isDay;
    while (endTime < this.scale.maxX) {
      this.drawArea(ctx, startTime, endTime, isDay ? dayColor : nightColor);
      isDay = !isDay;
      [startTime, endTime] = [endTime, startTime + lengthDay];
    }
    this.drawArea(ctx, startTime, this.scale.maxX, isDay ? dayColor : nightColor);
  }

  private drawArea(ctx: any, startTime: number, endTime: number, color: string) {
    ctx.fillStyle = color;
    let graphHeight = this.get("height") - margins.top - margins.bottom;
    ctx.fillRect(this.getX(startTime),
      this.getY(this.scale.maxY),
      this.getX(endTime) - this.getX(startTime),
      graphHeight);
  };

  private drawTemperatureScale(ctx: any) {
    let degreeHeight = this.getY(this.scale.minY + 1) - this.getY(this.scale.minY);
    let degreeStep = (degreeHeight > minVerticalDistance) ? 1
      : (2 * degreeHeight > minVerticalDistance) ? 2 : 5;
    let minHeight = Math.ceil(this.scale.minY / degreeStep) * degreeStep;
    ctx.strokeStyle = uiLineColor;
    ctx.lineWidth = uiLineWidth;
    for (let height = minHeight; height < this.scale.maxY; height += degreeStep) {
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
  }

  private drawTimeScale(ctx: any) {
    ctx.strokeStyle = uiLineColor;
    ctx.lineWidth = uiLineWidth;
    ctx.fillStyle = uiTextColor;
    ctx.font = uiFont;
    let minDay = Math.ceil(this.scale.minX / lengthDay) * lengthDay;
    for (let day = minDay; day < this.scale.maxX; day += lengthDay) {
      this.drawVerticalLine(ctx, day, 12);
      this.drawDayLabel(ctx, day);
    }
    let hourWidth = this.getX(this.scale.minX + lengthHour) - this.getX(this.scale.minX);
    let hourStep = (2 * hourWidth > minHorizontalDistance) ? 2 * lengthHour
      : (6 * hourWidth > minHorizontalDistance) ? 6 * lengthHour : undefined;
    if (hourStep) {
      let minHour = Math.ceil(this.scale.minX / hourStep) * hourStep;
      for (let hour = minHour; hour < this.scale.maxX; hour += hourStep) {
        this.drawVerticalLine(ctx, hour, 0);
        this.drawHourLabel(ctx, hour);
      }
    }
  }

  private drawVerticalLine(ctx: any, time: number, extraLength: number) {
    ctx.beginPath();
    ctx.moveTo(this.getX(time), this.getY(this.scale.minY));
    ctx.lineTo(this.getX(time), this.getY(this.scale.maxY) - extraLength);
    ctx.stroke();
  }
  private drawDayLabel(ctx: any, day: number) {
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    let dayName = daysNames[new Date(day).getDay()];
    ctx.fillText(dayName, this.getX(day) + 3, this.getY(this.scale.maxY) + 1);
  }

  private drawHourLabel(ctx: any, hour: number) {
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    let hourNumber = new Date(hour).getHours();
    let hourString = (hourNumber < 10) ? "0" + hourNumber + ":00" : hourNumber + ":00";
    ctx.fillText(hourString, this.getX(hour), this.getY(this.scale.minY) + 1);
  }

  private drawTemperatureCurve(ctx: any) {
    let points: Point[] = this.data.list.map((forecast) => ({ x: forecast.date.getTime(), y: forecast.temperature }));
    for (let i = 1; i < points.length - 1; i++) {
      points[i].dydx = this.estimateDerivative(points[i - 1], points[i], points[i + 1]);
    }
    let n = points.length - 1;
    points[0].dydx = (points[1].y - points[0].y) / (points[1].x - points[0].x);
    points[n].dydx = (points[n].y - points[n - 1].y) / (points[n].x - points[n - 1].x);
    for (let point of points) {
      this.drawPoint(ctx, point);
    }
    this.drawHermiteInterpolation(ctx, points);
  }

  private estimateDerivative(prev: Point, point: Point, next: Point): number {
    if ((prev.y > point.y && next.y > point.y)
      || (prev.y < point.y && next.y < point.y)) {
      return 0;
    } else {
      return (next.y - prev.y) / (next.x - prev.x);
    }
  }

  private drawHermiteInterpolation(ctx: any, points: Point[]) {
    ctx.strokeStyle = graphLineColor;
    ctx.lineWidth = 2;
    for (let i = 0; i < points.length - 1; i++) {
      ctx.beginPath();
      let [b0, b3] = [points[i], points[i + 1]];
      let h = (b3.x - b0.x) / 3;
      let b1 = { x: b0.x + h, y: b0.y + (h * b0.dydx) };
      let b2 = { x: b3.x - h, y: b3.y - (h * b3.dydx) };
      ctx.moveTo(this.getX(b0.x), this.getY(b0.y));
      ctx.bezierCurveTo(this.getX(b1.x), this.getY(b1.y), this.getX(b2.x), this.getY(b2.y), this.getX(b3.x), this.getY(b3.y))
      ctx.stroke();
    }
  }

  private drawPoint(ctx: any, point: Point) {
    ctx.strokeStyle = graphLineColor;
    ctx.strokeRect(this.getX(point.x) - 3, this.getY(point.y) - 3, 6, 6);
  }

  private getX(time: number): number {
    let graphWidth = this.get("width") - margins.left - margins.right;
    let ratio = (time - this.scale.minX) / (this.scale.maxX - this.scale.minX);
    return margins.left + (graphWidth * ratio);
  }

  private getY(temperature: number): number {
    let graphHeight = this.get("height") - margins.top - margins.bottom;
    let ratio = (temperature - this.scale.minY) / (this.scale.maxY - this.scale.minY);
    return margins.top + graphHeight * (1 - ratio);
  }
}

interface Point { x: number; y: number; dydx?: number; };
