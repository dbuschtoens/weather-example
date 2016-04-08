import {WeatherData} from "./weatherService";

export default class BackgroundLayer extends tabris.Composite {
  private clouds: tabris.ImageView[];
  private distance: number[];

  constructor(properties: tabris.CompositeProperties) {
    super(properties);
    this.clouds = [];
    this.distance = [];
  }

  public generateNewClouds() {
    for (let cloud of this.clouds) {
      cloud.dispose();
    }
    this.clouds = [];
    this.distance = [];
    let count = 6;
    let positions = this.generateDistribution(count);
    for (let i = 0; i < count; i++) {
      this.clouds[i] = this.generateCloud(positions[i], this.distance[i]).appendTo(this);
    }
  };

  public scroll(offset: number) {
    for (let i = 0; i < this.clouds.length; i++) {
      let previousTransform = <Transformation>this.clouds[i].get("transform");
      this.clouds[i].set("transform", {
        translationX: previousTransform.translationX,
        scaleX: previousTransform.scaleX,
        scaleY: previousTransform.scaleY,
        translationY: offset * ((this.distance[i] / 10) * 0.8 + 0.2)
      });
    }
  }

  private generateDistribution(n: number): number[] {
    let result = [];
    let initialOffset = 140;
    let height = this.get("bounds").height - initialOffset;
    let extraOffset = (height * 0.2) / n;
    for (let i = 0; i < n; i++) {
      result.push(initialOffset + (i * 0.8 * (height / n) + i * extraOffset));
      this.distance[i] = Math.random() * 10;
    }
    return result;
  }

  private generateCloud(position: number, distance: number) {
    let cloudImage = Math.ceil(Math.random() * 21);
    let horizontalOffset = Math.ceil((0.5 - Math.random()) * this.get("bounds").width);
    let scale = ((10 - distance) / 10) * 1.6 + 0.4;
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
