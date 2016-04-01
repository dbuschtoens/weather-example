/// <reference path="../typings/browser.d.ts" />

import {WeatherData} from "./weatherService";

const daysNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const uiFont = "12px sans-serif";
const uiLineColor = "rgba(20,20,20,0.3)";
const uiLineWidth = 2;
const uiTextColor = "rgba(20,20,20,0.5)";
const graphLineColor = "rgba(20,20,20,0.7)";
const nightColor = "rgba(0,0,60,0.3)";
const dayColor = "rgba(255,187,69,0.3)";
const dayLength = 24 * 60 * 60 * 1000;

interface WeatherGraphProperties extends tabris.CanvasProperties {
  data: WeatherData;
}

export default class WeatherGraph extends tabris.Canvas {
  private margins = { top: 20, left: 30, bottom: 10, right: 10, width: 0, height: 0 }; // remove?
  private scale: { minX: number, maxX: number, minY: number, maxY: number };
  private data: WeatherData;

  constructor(properties: WeatherGraphProperties) {
    super(properties);
    this.data = properties.data;
    this.init();
    this.on("resize", (canvas, bounds) => {
      let height = tabris.device.get("screenHeight") / 3;
      let width = tabris.device.get("screenWidth");
      this.set("height", height);
      this.set("width", width);
      let ctx = <any>this.getContext("2d", width, height);
      this.margins.width = this.get("width") - this.margins.left - this.margins.right;
      this.margins.height = this.get("height") - this.margins.top - this.margins.bottom;
      this.draw(ctx);
    });
  }

  private init() {
    let minTime = this.data.current.date.getTime();
    let maxTime = this.data.forecasts[this.data.forecasts.length - 1].date.getTime();
    let temperatures = this.data.forecasts.map((forcast) => forcast.temperature)
      .concat(this.data.current.temperature);
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

  private draw(ctx: any) {
    this.drawBackground(ctx);
    this.drawTemperatureCurve(ctx);
    this.drawTemperatureScale(ctx, 5);
    this.drawTimeScale(ctx);
  }

  private drawBackground(ctx: any) {
    let sunriseTime = this.data.sunriseTime.getTime();
    let sunsetTime = this.data.sunsetTime.getTime();
    let now = this.scale.minX;
    let isDay = (sunriseTime < now && now < sunsetTime);
    sunriseTime += (now > sunriseTime) ? dayLength : 0;
    sunsetTime += (now > sunsetTime) ? dayLength : 0;
    let startTime = Math.min(sunriseTime, sunsetTime);
    let endTime = Math.max(sunriseTime, sunsetTime);

    this.drawArea(ctx, now, startTime, isDay ? dayColor : nightColor);
    isDay = !isDay;
    while (endTime < this.scale.maxX) {
      this.drawArea(ctx, startTime, endTime, isDay ? dayColor : nightColor);
      isDay = !isDay;
      [startTime, endTime] = [endTime, startTime + dayLength];
    }
    this.drawArea(ctx, startTime, this.scale.maxX, isDay ? dayColor : nightColor);
  }

  private drawArea(ctx: any, startTime: number, endTime: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(this.getX(startTime),
      this.margins.top,
      this.getX(endTime) - this.getX(startTime),
      this.margins.height);
  };

  private drawTemperatureScale(ctx: any, density: number) {
    let minHeight = Math.ceil(this.scale.minY / density) * density;
    ctx.strokeStyle = uiLineColor;
    ctx.lineWidth = uiLineWidth;
    for (let height = minHeight; height < this.scale.maxY; height += density) {
      // horizontal line
      ctx.beginPath();
      ctx.moveTo(this.margins.left, this.getY(height));
      ctx.lineTo(this.margins.left + this.margins.width, this.getY(height));
      ctx.stroke();
      // text label
      ctx.fillStyle = uiTextColor;
      ctx.font = uiFont;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(height + "°C", this.margins.left - 2, this.getY(height));
    }
  }

  private drawTimeScale(ctx: any) {
    let minDay = Math.ceil(this.scale.minX / dayLength) * dayLength;
    ctx.strokeStyle = uiLineColor;
    ctx.lineWidth = uiLineWidth;
    for (let day = minDay; day < this.scale.maxX; day += dayLength) {
      // vertical line
      ctx.beginPath();
      ctx.moveTo(this.getX(day), this.margins.top + this.margins.height);
      ctx.lineTo(this.getX(day), this.margins.top - 12);
      ctx.stroke();
      // text label
      ctx.fillStyle = uiTextColor;
      ctx.font = uiFont;
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      let dayName = daysNames[new Date(day).getDay()];
      ctx.fillText(dayName, this.getX(day) + 3, this.margins.top +1);
    }
  }

  private drawTemperatureCurve(ctx: any) {
    ctx.beginPath();
    ctx.strokeStyle = graphLineColor;
    ctx.lineWidth = 3;
    ctx.moveTo(this.getX(this.data.current.date.getTime()), this.getY(this.data.current.temperature));
    for (let index = 0; index < this.data.forecasts.length; index++) {
      ctx.lineTo(this.getX(this.data.forecasts[index].date.getTime()),
        this.getY(this.data.forecasts[index].temperature));
      // TODO: calculate correct cps for a continuous bezier path
    }
    ctx.stroke();
  }

  private getX(time: number): number {
    let ratio = (time - this.scale.minX) / (this.scale.maxX - this.scale.minX);
    let x = this.margins.left + (this.margins.width * ratio);
    return x;
  }

  private getY(temperature: number): number {
    let ratio = (temperature - this.scale.minY) / (this.scale.maxY - this.scale.minY);
    let y = this.margins.top + this.margins.height * (1 - ratio);
    return y;
  }
}
