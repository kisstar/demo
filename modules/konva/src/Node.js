export class Node {
  constructor(config) {
    this.config = config;
  }

  draw() {
    this.drawScene();
    return this;
  }
}
