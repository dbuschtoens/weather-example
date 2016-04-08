
import {WeatherData, WeatherDatum} from "./weatherService";

const daysNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const uiFont = "12px sans-serif";
const uiLineColor = "rgba(255,255,255,0.3)";
const uiTextColor = "rgba(255,255,255,0.5)";
const graphLineColor = "rgba(255,255,255,0.55)";
const uiLineWidth = 1.5;
const graphLineWidth = 1;
const minHorizontalDistance = 33;
const minVerticalDistance = 25;
const hourLength = 60 * 60 * 1000;
const dayLength = 24 * 60 * 60 * 1000;
const margins = { top: 20, left: 30, bottom: 13, right: 10 };
const maxZoom = 5;

interface WeatherGraphProperties extends tabris.CanvasProperties {
  data: WeatherData;
}

export default class WeatherGraph extends tabris.Canvas {
  private dataPoints: WeatherDatum[];
  private data: WeatherData;
  private scale: { minX: number, maxX: number, minY: number, maxY: number };
  public nightColor: string;
  public dayColor: string;

  constructor(properties: WeatherGraphProperties) {
    super(properties);
    this.nightColor = "rgba(103,113,145,0.392)";
    this.dayColor = "rgba(131,156,188,0.286)";
    this.data = properties.data;
    this.scale = {
      minX: this.data.list[0].date.getTime(),
      maxX: this.data.list[this.data.list.length - 1].date.getTime(),
      minY: 0,
      maxY: 0
    };
    this.initDataPoints();
    this.initScale();
    this.draw();
  }

  public zoom(factor: number) {
    let meanTime = (this.scale.maxX + this.scale.minX) / 2;
    let halfRange = this.scale.maxX - meanTime;
    let [newMin, newMax] = [meanTime - (halfRange * factor), meanTime + (halfRange * factor)];
    let [minTime, maxTime] = [this.data.list[0].date.getTime(), this.data.list[this.data.list.length - 1].date.getTime()];
    let offset = newMin < minTime ? minTime - newMin : newMax > maxTime ? maxTime - newMax : 0;
    newMin += offset;
    newMax += offset;
    if ((newMax - newMin) >= (maxTime - minTime)) {
      [newMin, newMax] = [minTime, maxTime];
    };
    this.setScale(newMin, newMax);
  }

  public setScale(newMin: number, newMax: number) {
    [this.scale.minX, this.scale.maxX] = [newMin, newMax];
    this.initDataPoints();
    this.initScale();
    this.draw();
  }

  public draw() {
    let ctx = <any>this.getContext("2d", this.get("width"), this.get("height"));
    this.drawBackground(ctx);
    this.drawTemperatureScale(ctx);
    this.drawTimeScale(ctx);
    this.drawTemperatureCurve(ctx);
  }

  private initDataPoints() {
    this.dataPoints = this.data.list.filter((datum) =>
      (datum.date.getTime() > this.scale.minX && datum.date.getTime() < this.scale.maxX)
    );
    let firstIndex = this.data.list.indexOf(this.dataPoints[0]);
    let lastIndex = this.data.list.indexOf(this.dataPoints[this.dataPoints.length - 1]);
    if (firstIndex > 0) {
      this.dataPoints.unshift(this.data.getWeatherAtDate(new Date(this.scale.minX)));
    }
    if (lastIndex < this.data.list.length - 1) {
      this.dataPoints.push(this.data.getWeatherAtDate(new Date(this.scale.maxX)));
    }
  }

  private initScale() {
    let temperatures = this.dataPoints.map((forcast) => forcast.temperature);
    let [minTemp, maxTemp] = [Math.min(...temperatures), Math.max(...temperatures)];
    let meanTemp = (maxTemp + minTemp) / 2;
    let tempScaleFactor = 1.2;
    this.scale.minY = meanTemp + tempScaleFactor * (minTemp - meanTemp);
    this.scale.maxY = meanTemp + tempScaleFactor * (maxTemp - meanTemp);
  }


  private drawBackground(ctx: any) {
    let now = this.scale.minX;
    let dayOffset = new Date(now).getDate() - this.data.list[0].date.getDate();
    let sunriseTime = this.data.sunriseTime.getTime() + dayOffset * dayLength;
    let sunsetTime = this.data.sunsetTime.getTime() + dayOffset * dayLength;
    let isDay = (sunriseTime < now && now < sunsetTime);
    sunriseTime += (now > sunriseTime) ? dayLength : 0;
    sunsetTime += (now > sunsetTime) ? dayLength : 0;
    let startTime = Math.min(sunriseTime, sunsetTime);
    let endTime = Math.max(sunriseTime, sunsetTime);

    this.drawArea(ctx, now, startTime, isDay ? this.dayColor : this.nightColor);
    isDay = !isDay;
    while (endTime < this.scale.maxX) {
      this.drawArea(ctx, startTime, endTime, isDay ? this.dayColor : this.nightColor);
      isDay = !isDay;
      [startTime, endTime] = [endTime, startTime + dayLength];
    }
    this.drawArea(ctx, startTime, this.scale.maxX, isDay ? this.dayColor : this.nightColor);
  }

  private drawArea(ctx: any, startTime: number, endTime: number, color: string) {
    ctx.fillStyle = color;
    let graphHeight = this.get("height") - margins.top - margins.bottom;
    ctx.fillRect(this.getX(startTime),
      this.getY(this.scale.maxY),
      this.getX(endTime) - this.getX(startTime),
      graphHeight
    );
  };

  private drawTemperatureScale(ctx: any) {
    let degreeHeight = this.getY(this.scale.minY) - this.getY(this.scale.minY + 1);
    let degreeStep = (degreeHeight > minVerticalDistance) ? 1 : (2 * degreeHeight > minVerticalDistance) ? 2 : 5;
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
    let minDay = new Date(this.scale.minX).setHours(0, 0, 0, 0);
    minDay += (minDay === this.scale.minX) ? 0 : dayLength;
    for (let day = minDay; day < this.scale.maxX; day += dayLength) {
      this.drawVerticalLine(ctx, day, 12);
      this.drawDayLabel(ctx, day);
    }
    let hourWidth = this.getX(this.scale.minX + hourLength) - this.getX(this.scale.minX);
    let hourStep = (2 * hourWidth > minHorizontalDistance) ? 2
      : (6 * hourWidth > minHorizontalDistance) ? 6 : undefined;
    if (hourStep) {
      let minHour = Math.ceil((new Date(this.scale.minX).getHours() + 1) / hourStep) * hourStep;
      let hour = new Date(this.scale.minX).setHours(minHour, 0, 0, 0);
      for (; hour < this.scale.maxX; hour += hourStep * hourLength) {
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
    let points: Point[] = this.dataPoints.map((forecast) => ({ x: forecast.date.getTime(), y: forecast.temperature }));
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
    if ((prev.y > point.y && next.y > point.y) || (prev.y < point.y && next.y < point.y)) {
      return 0;
    } else {
      return (next.y - prev.y) / (next.x - prev.x);
    }
  }

  private drawHermiteInterpolation(ctx: any, points: Point[]) {
    ctx.strokeStyle = graphLineColor;
    ctx.lineWidth = graphLineWidth;
    for (let i = 0; i < points.length - 1; i++) {
      ctx.beginPath();
      let [b0, b3] = [points[i], points[i + 1]];
      let h = (b3.x - b0.x) / 3;
      let b1 = { x: b0.x + h, y: b0.y + (h * b0.dydx) };
      let b2 = { x: b3.x - h, y: b3.y - (h * b3.dydx) };
      ctx.moveTo(this.getX(b0.x), this.getY(b0.y));
      ctx.bezierCurveTo(
        this.getX(b1.x), this.getY(b1.y),
        this.getX(b2.x), this.getY(b2.y),
        this.getX(b3.x), this.getY(b3.y)
      );
      ctx.stroke();
    }
  }

  private drawPoint(ctx: any, point: Point) {
    ctx.fillStyle = graphLineColor;
    ctx.fillRect(this.getX(point.x) - 2, this.getY(point.y) - 2, 4, 4);
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
