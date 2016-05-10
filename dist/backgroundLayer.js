"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var tabris_1 = require("tabris");
var BackgroundLayer = (function (_super) {
    __extends(BackgroundLayer, _super);
    function BackgroundLayer(properties) {
        var _this = this;
        _super.call(this, properties);
        this.clouds = [];
        this.distance = [];
        this.on("resize", function () { return _this.generateNewClouds(); });
    }
    BackgroundLayer.prototype.generateNewClouds = function () {
        for (var _i = 0, _a = this.clouds; _i < _a.length; _i++) {
            var cloud = _a[_i];
            cloud.dispose();
        }
        if (this.get("bounds").width === 0 || this.get("bounds").height === 0) {
            return;
        }
        this.clouds = [];
        this.distance = [];
        var count = 6;
        var positions = this.generateDistribution(count);
        for (var i = 0; i < count; i++) {
            this.clouds[i] = this.generateCloud(positions[i], this.distance[i]).appendTo(this);
        }
    };
    ;
    BackgroundLayer.prototype.scroll = function (offset) {
        for (var i = 0; i < this.clouds.length; i++) {
            var previousTransform = this.clouds[i].get("transform");
            this.clouds[i].set("transform", {
                translationX: previousTransform.translationX,
                scaleX: previousTransform.scaleX,
                scaleY: previousTransform.scaleY,
                translationY: offset * ((this.distance[i] / 10) * 0.8 + 0.2)
            });
        }
    };
    BackgroundLayer.prototype.generateDistribution = function (n) {
        var result = [];
        var initialOffset = 140;
        var height = this.get("bounds").height - initialOffset;
        var extraOffset = (height * 0.2) / n;
        for (var i = 0; i < n; i++) {
            result.push(initialOffset + (i * 0.8 * (height / n) + i * extraOffset));
            this.distance[i] = Math.random() * 10;
        }
        return result;
    };
    BackgroundLayer.prototype.generateCloud = function (position, distance) {
        var cloudImage = Math.ceil(Math.random() * 6);
        var horizontalOffset = Math.ceil((0.5 - Math.random()) * this.get("bounds").width);
        var scale = ((10 - distance) / 10) * 1.6 + 0.4;
        return new tabris_1.ImageView({
            image: "/images/cloud" + cloudImage + ".png",
            width: this.get("bounds").width,
            scaleMode: "fill",
            top: position,
            centerX: 0,
            opacity: 0.7,
            transform: {
                translationX: horizontalOffset,
                scaleX: scale,
                scaleY: scale
            }
        });
    };
    return BackgroundLayer;
}(tabris_1.Composite));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BackgroundLayer;
