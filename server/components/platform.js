class Platform {
  constructor({ position, height, width, color }) {
    this.position = position;
    this.height = height;
    this.width = width;
    this.color = color;
    this.unpassable = false;
  }
}

exports.Platform = Platform;
