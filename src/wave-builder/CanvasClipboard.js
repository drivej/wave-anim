export default class CanvasClipboard {
  $cvs;
  ctx;
  width;
  height;

  constructor() {
    this.$cvs = document.createElement('canvas');
    this.ctx = this.$cvs.getContext('2d', { alpha: true, desynchronized: true });
    this.setSize(100, 100);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  setSize(w, h) {
    this.width = w;
    this.height = h;
    this.$cvs.width = w;
    this.$cvs.height = h;
  }
}
