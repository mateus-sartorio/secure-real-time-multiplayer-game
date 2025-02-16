export const COLLECTBLE_SIZE = 36;

class Collectible {
  constructor({ x, y, value, id }) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
    this.collectibleImage = new Image();
    this.collectibleImage.src = `/public/assets/collectibles/ball_${value}.png`;
  }

  draw(context) {
    if (this.collectibleImage.complete) {
      context.drawImage(this.collectibleImage, this.x, this.y, COLLECTBLE_SIZE, COLLECTBLE_SIZE);
    }
  }
}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
