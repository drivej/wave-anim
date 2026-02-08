import CanvasClipboard from './CanvasClipboard';

export default class WaveCanvas {
  clipboard = new CanvasClipboard();
  overlay = new CanvasClipboard();
  $cvs;
  ctx;
  wave = [];
  nextWave = Array(128).fill(0);
  requestFrame;
  scaleDeltaX = 1.0;
  scaleDeltaY = 1.0;
  fadeRate = 0.85;
  width = 1;
  height = 1;
  waveColor = '#ffcb77';
  hue = 45;

  constructor(config) {
    if(config?.waveColor) this.waveColor = config.waveColor;
    this.$cvs = document.createElement('canvas');
    this.ctx = this.$cvs.getContext('2d', { alpha: true, desynchronized: true });
    this.$clipboard = document.createElement('canvas');
    this.clipboard_ctx = this.$clipboard.getContext('2d', { alpha: true, desynchronized: true });
    this.setSize(500, 200);
  }

  clear() {
    let cw = this.$cvs.width;
    let ch = this.$cvs.height;
    // this.ctx.clearRect(0, 0, cw, ch);
    // return;

    this.ctx.save();
    let nw = cw * this.scaleDeltaX;
    let nh = ch * this.scaleDeltaY;
    let nx = (cw - nw) * 0.5;
    let ny = (ch - nh) * 0.5;
    let blur = 1.1;

    this.ctx.globalAlpha = this.fadeRate;
    this.ctx.filter = `blur(${blur}px) hue-rotate(${this.hue}deg)`;

    this.clipboard.clear();
    this.clipboard.ctx.drawImage(this.$cvs, 0, 0);

    this.ctx.clearRect(0, 0, cw, ch);
    this.ctx.drawImage(this.clipboard.$cvs, 0, 0, cw, ch, nx, ny, nw, nh);
    this.ctx.restore();
  }

  drawOverlay() {
    this.overlay.clear();
    let h = this.overlay.height;
    let w = this.overlay.width;
    let barW = 2;
    this.overlay.ctx.fillStyle = '#000';
    for (var i = 0; i < w; i += barW * 2) {
      this.overlay.ctx.fillRect(i, 0, barW, h);
    }
  }

  draw(wave) {
    this.clear();
    var w = this.$cvs.width;
    var h = this.$cvs.height;
    var cy = h * 0.5;
    var stepX = w / wave.length;
    let i = wave.length;
    let n, x, y, eh, ey;

    this.clipboard.clear();
    this.clipboard.ctx.fillStyle = this.waveColor;
    this.clipboard.ctx.beginPath();
    this.clipboard.ctx.moveTo(w, cy);

    while (i--) {
      n = wave[i];
      x = Math.round(i * stepX);
      eh = n * h;
      ey = cy - eh * 0.5;
      this.clipboard.ctx.lineTo(x, ey);
    }
    this.clipboard.ctx.lineTo(0, cy);
    this.clipboard.ctx.closePath();
    this.clipboard.ctx.fill();

    this.ctx.drawImage(this.clipboard.$cvs, 0, 0, w, cy, 0, 0, w, cy);
    this.ctx.translate(0, h - 1);
    this.ctx.scale(1, -1);
    this.ctx.drawImage(this.clipboard.$cvs, 0, 0, w, cy, 0, 0, w, cy);

    // this.ctx.drawImage(this.overlay.$cvs, 0, 0);
  }

  drawBlob(wave, clipIndex) {
    this.clear();
    var w = this.$cvs.width;
    var h = this.$cvs.height;
    var stepX = w / clipIndex;
    let i = -1;
    let n, x, y, eh, ey;

    this.clipboard.clear();
    this.clipboard.ctx.fillStyle = '#fff';
    this.clipboard.ctx.beginPath();
    this.clipboard.ctx.moveTo(0, h * 0.5);

    while (i++ < clipIndex) {
      n = wave[i];
      x = Math.round(i * stepX);
      eh = (n / 255) * h;
      ey = h * 0.5 - eh * 0.5;
      this.clipboard.ctx.lineTo(x, ey);
    }
    this.clipboard.ctx.lineTo(w, h * 0.5);
    this.clipboard.ctx.closePath();
    this.clipboard.ctx.fill();

    this.ctx.drawImage(this.clipboard.$cvs, 0, 0, w, h * 0.5, 0, 0, w, h * 0.5);
    this.ctx.translate(0, h - 1);
    this.ctx.scale(1, -1);
    this.ctx.drawImage(this.clipboard.$cvs, 0, 0, w, h * 0.5, 0, 0, w, h * 0.5);
  }

  setSize(w, h) {
    this.width = w;
    this.height = h;
    this.clipboard.setSize(w, h);
    this.clipboard.ctx.drawImage(this.$cvs, 0, 0, this.width, this.height, 0, 0, w, h);
    this.$cvs.width = w;
    this.$cvs.height = h;
    this.ctx.drawImage(this.clipboard.$cvs, 0, 0);
    this.ctx.fillStyle = this.waveColor;
    this.overlay.setSize(w, h);
    this.drawOverlay();
  }
}
