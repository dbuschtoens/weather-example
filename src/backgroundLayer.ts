/// <reference path="../typings/browser.d.ts" />
import {WeatherData} from "./weatherService";

export default class BackgroundLayer extends tabris.Composite {
  private clouds: tabris.ImageView[];
  private offsetFactors: number[];

  constructor(properties: tabris.CompositeProperties) {
    super(properties);
    this.clouds = [];
    this.offsetFactors = [];
  }

  public generateNewClouds(count?: number) {
    for (let cloud of this.clouds) {
      cloud.dispose();
    }
    this.clouds = [];
    this.offsetFactors = [];
    if (!count) count = 14;
    console.log("drawing " + count + " clouds");
    let positions = this.generateDistribution(count);
    console.log("cloud positions: ");
    positions.forEach((pos) => console.log(Math.round(pos)));
    for (let i = 0; i < count; i++) {
      this.clouds[i] = this.generateCloud(positions[i]).appendTo(this);
      this.offsetFactors[i] = Math.random() * 0.5 + 0.2;
    }
  };

  public scroll(offset: number) {
    for (let i = 0; i < this.clouds.length; i++) {
      let previousTransform = <Transformation>this.clouds[i].get("transform");
      this.clouds[i].set("transform", {
        translationX: previousTransform.translationX,
        scaleX: previousTransform.scaleX,
        scaleY: previousTransform.scaleY,
        translationY: offset * this.offsetFactors[i]
      });
    }
  }

  private generateDistribution(n: number): number[] {
    let result = [];
    let height = this.get("bounds").height;
    let extraOffset = (height * 0.2) / n;
    for (let i = 0; i < n; i++) {
      result.push(i * 0.8 * (height / n) + i * extraOffset);
    }

    return result;
  }



  private generateCloud(position: number) {
    let cloudImage = Math.ceil(Math.random() * 21);
    let horizontalOffset = Math.ceil((0.5 - Math.random()) * this.get("bounds").width);
    let scale = ((Math.random() * 0.7) + 1);
    return new tabris.ImageView({
      image: "/images/cloud" + cloudImage + ".png",
      width: this.get("bounds").width,
      scaleMode: "fill",
      top: position,
      centerX: 0,
      opacity: 0.8,
      transform: {
        translationX: horizontalOffset,
        scaleX: scale,
        scaleY: scale
      }
    });
  }
}
