import { jsxs as C, jsx as g, Fragment as D } from "react/jsx-runtime";
import { makeObservable as E, observable as v, action as n, reaction as b } from "mobx";
import { forwardRef as F, useRef as k, useState as M, useImperativeHandle as _, useEffect as $ } from "react";
import { Howl as z, Howler as w } from "howler";
import { debounce as R } from "lodash";
const A = 64, d = Array(A).fill(0), B = 10, j = 0.85, q = -80, O = -10, G = Math.pow(2, 11);
class H {
  constructor() {
    this.bufferLength = 0, this.dataArray = new Uint8Array(), this.wave = d, this.fullWave = d, this.built = !1, this.nodesConnected = !1, this.howlId = -1, this.src = "", this.loaded = !1, this.isLoading = !1, this.shouldPlay = !1, this.throttle = 100, this.isMuted = !1, this.isLocked = !0, this.play = R(() => {
      this.howl && (this.shouldPlay = !0, !this.howl.playing(this.howlId) && (this.howl.play(this.howlId), this.buildNodes(), this.hijackBuffer()));
    }, 50), E(this, {
      wave: v,
      fullWave: v,
      getWaveData: n,
      updateWave: n,
      seek: n.bound,
      tick: n.bound,
      resetWave: n,
      loaded: v,
      isLoading: v,
      isMuted: v,
      toggleMute: n.bound,
      setMute: n.bound,
      shouldPlay: v,
      isLocked: v
    });
  }
  resetWave() {
    this.wave = d, this.fullWave = d;
  }
  setSource(t) {
    this.src !== t && (this.src = t, this.loaded = !1, this.isLoading = !0, this.stopTick(), this.howl && (this.howl.stop(), this.howl.unload()), this.resetWave(), this.nodesConnected = !1, this.built = !1, this.howl = new z({
      src: t,
      autoplay: !1,
      mute: !1,
      html5: !1,
      // Use Web Audio API for better control
      onplay: () => {
        this.shouldPlay ? (this.buildNodes(), this.hijackBuffer(), this.startTick()) : this.pause();
      },
      onpause: () => {
        this.shouldPlay ? this.play() : this.stopTick();
      },
      onload: n(() => {
        this.fullWave = this.getFullWave(), this.loaded = !0, this.isLoading = !1, this.shouldPlay && this.play();
      }),
      onend: n(() => {
        this.wave = d, this.shouldPlay = !1;
      }),
      onunlock: n(() => {
        this.isLocked = !1;
      })
    }), this.howlId = this.howl.play(), this.howl.pause(this.howlId));
  }
  pause() {
    this.howl && (this.shouldPlay = !1, this.stopTick(), this.play?.cancel(), this.howl.pause(this.howlId));
  }
  togglePlay() {
    this.shouldPlay ? this.pause() : this.play();
  }
  toggleMute() {
    this.isMuted = !this.isMuted, this.updateGain();
  }
  setMute(t) {
    this.isMuted = t, this.updateGain();
  }
  updateGain() {
    this.gainNode && this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : 1, w.ctx.currentTime);
  }
  seek(t = 0) {
    this.howl.pause(this.howlId), this.howl.seek(t, this.howlId);
  }
  setPlaybackRate(t) {
    this.howl.rate(t, this.howlId);
  }
  startTick() {
    this.stopTick(), this.tick();
  }
  tick() {
    this.tickTimeout = setTimeout(() => {
      this.updateWave(), this.requestFrame = requestAnimationFrame(this.tick);
    }, this.throttle / B);
  }
  stopTick() {
    this.tickTimeout && clearTimeout(this.tickTimeout), this.requestFrame && cancelAnimationFrame(this.requestFrame);
  }
  hijackBuffer() {
    const t = this.howl._sounds?.[0]?._node;
    t?.bufferSource?.disconnect(), t?.bufferSource?.connect(this.analyserNode), this.nodesConnected || (this.analyserNode?.connect(this.gainNode), this.gainNode?.connect(w.ctx.destination), this.nodesConnected = !0);
  }
  buildNodes() {
    this.built || (this.built = !0, this.analyserNode = w.ctx.createAnalyser(), this.analyserNode.minDecibels = q, this.analyserNode.maxDecibels = O, this.analyserNode.smoothingTimeConstant = j, this.analyserNode.fftSize = G, this.bufferLength = this.analyserNode.frequencyBinCount, this.dataArray = new Uint8Array(this.bufferLength), this.gainNode = w.ctx.createGain(), this.gainNode.gain.setValueAtTime(1, 0));
  }
  updateWave() {
    this.wave = this.getWaveData();
  }
  getRawWave() {
    return this.analyserNode.getByteFrequencyData(this.dataArray), this.dataArray;
  }
  getWaveData() {
    if (this.analyserNode) {
      this.analyserNode.getByteFrequencyData(this.dataArray);
      let t = this.dataArray.length;
      for (; t-- && t > A && this.dataArray[t] === 0; ) ;
      return Array.from(this.dataArray.slice(0, t)).map((i) => i / 255);
    }
    return d;
  }
  getFullWave(t = 500) {
    const a = this.howl._sounds?.[0]?._node?.bufferSource?.buffer;
    if (!a) return d;
    const s = a.getChannelData(0), r = Math.floor(s.length / t);
    let e = [], h = 0, l = 0, o = 0, c = 0;
    const m = Math.abs;
    for (h = 0; h < t; h++) {
      for (o = 0, c = r * h, l = 0; l < r; l++)
        o += m(s[c + l]);
      e.push(o / r);
    }
    const y = Math.pow(Math.max(...e), -1);
    return e = e.map((x) => x * y), isNaN(e[0]) && (e = d), e;
  }
}
class T {
  $cvs;
  ctx;
  width;
  height;
  constructor() {
    this.$cvs = document.createElement("canvas"), this.ctx = this.$cvs.getContext("2d", { alpha: !0, desynchronized: !0 }), this.setSize(100, 100);
  }
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  setSize(t, i) {
    this.width = t, this.height = i, this.$cvs.width = t, this.$cvs.height = i;
  }
}
class V {
  clipboard = new T();
  overlay = new T();
  $cvs;
  ctx;
  wave = [];
  nextWave = Array(128).fill(0);
  requestFrame;
  scaleDeltaX = 1;
  scaleDeltaY = 1;
  fadeRate = 0.85;
  width = 1;
  height = 1;
  waveColor = "#ffcb77";
  hue = 45;
  constructor(t) {
    t?.waveColor && (this.waveColor = t.waveColor), this.$cvs = document.createElement("canvas"), this.ctx = this.$cvs.getContext("2d", { alpha: !0, desynchronized: !0 }), this.$clipboard = document.createElement("canvas"), this.clipboard_ctx = this.$clipboard.getContext("2d", { alpha: !0, desynchronized: !0 }), this.setSize(500, 200);
  }
  clear() {
    let t = this.$cvs.width, i = this.$cvs.height;
    this.ctx.save();
    let a = t * this.scaleDeltaX, s = i * this.scaleDeltaY, r = (t - a) * 0.5, e = (i - s) * 0.5, h = 1.1;
    this.ctx.globalAlpha = this.fadeRate, this.ctx.filter = `blur(${h}px) hue-rotate(${this.hue}deg)`, this.clipboard.clear(), this.clipboard.ctx.drawImage(this.$cvs, 0, 0), this.ctx.clearRect(0, 0, t, i), this.ctx.drawImage(this.clipboard.$cvs, 0, 0, t, i, r, e, a, s), this.ctx.restore();
  }
  drawOverlay() {
    this.overlay.clear();
    let t = this.overlay.height, i = this.overlay.width, a = 2;
    this.overlay.ctx.fillStyle = "#000";
    for (var s = 0; s < i; s += a * 2)
      this.overlay.ctx.fillRect(s, 0, a, t);
  }
  draw(t) {
    this.clear();
    var i = this.$cvs.width, a = this.$cvs.height, s = a * 0.5, r = i / t.length;
    let e = t.length, h, l, o, c;
    for (this.clipboard.clear(), this.clipboard.ctx.fillStyle = this.waveColor, this.clipboard.ctx.beginPath(), this.clipboard.ctx.moveTo(i, s); e--; )
      h = t[e], l = Math.round(e * r), o = h * a, c = s - o * 0.5, this.clipboard.ctx.lineTo(l, c);
    this.clipboard.ctx.lineTo(0, s), this.clipboard.ctx.closePath(), this.clipboard.ctx.fill(), this.ctx.drawImage(this.clipboard.$cvs, 0, 0, i, s, 0, 0, i, s), this.ctx.translate(0, a - 1), this.ctx.scale(1, -1), this.ctx.drawImage(this.clipboard.$cvs, 0, 0, i, s, 0, 0, i, s);
  }
  drawBlob(t, i) {
    this.clear();
    var a = this.$cvs.width, s = this.$cvs.height, r = a / i;
    let e = -1, h, l, o, c;
    for (this.clipboard.clear(), this.clipboard.ctx.fillStyle = "#fff", this.clipboard.ctx.beginPath(), this.clipboard.ctx.moveTo(0, s * 0.5); e++ < i; )
      h = t[e], l = Math.round(e * r), o = h / 255 * s, c = s * 0.5 - o * 0.5, this.clipboard.ctx.lineTo(l, c);
    this.clipboard.ctx.lineTo(a, s * 0.5), this.clipboard.ctx.closePath(), this.clipboard.ctx.fill(), this.ctx.drawImage(this.clipboard.$cvs, 0, 0, a, s * 0.5, 0, 0, a, s * 0.5), this.ctx.translate(0, s - 1), this.ctx.scale(1, -1), this.ctx.drawImage(this.clipboard.$cvs, 0, 0, a, s * 0.5, 0, 0, a, s * 0.5);
  }
  setSize(t, i) {
    this.width = t, this.height = i, this.clipboard.setSize(t, i), this.clipboard.ctx.drawImage(this.$cvs, 0, 0, this.width, this.height, 0, 0, t, i), this.$cvs.width = t, this.$cvs.height = i, this.ctx.drawImage(this.clipboard.$cvs, 0, 0), this.ctx.fillStyle = this.waveColor, this.overlay.setSize(t, i), this.drawOverlay();
  }
}
const K = F(({ width: u, height: t, className: i, style: a, audioSrc: s }, r) => {
  const e = k(new H()), h = k(new V()), l = k(null), [o, c] = M(!1), [m, y] = M(!0), [x, I] = M(!0);
  _(r, () => ({
    play: () => e.current.play(),
    pause: () => e.current.pause(),
    togglePlay: () => e.current.togglePlay(),
    toggleMute: () => e.current.toggleMute(),
    get isPlaying() {
      return e.current.shouldPlay;
    },
    get isMuted() {
      return e.current.isMuted;
    },
    get isLocked() {
      return e.current.isLocked;
    }
  })), $(() => {
    const p = l.current;
    p && (p.innerHTML = "", h.current.setSize(u, t), p.appendChild(h.current.$cvs), p.appendChild(h.current.overlay.$cvs), p.style.cursor = "pointer", Object.assign(h.current.overlay.$cvs.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none"
    }), Object.assign(h.current.$cvs.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%"
    }));
  }, []), $(() => {
    h.current.setSize(u, t);
  }, [u, t]), $(() => {
    if (!s) return;
    e.current.setSource(s), e.current.pause(), e.current.setMute(!0);
    const p = b(
      () => e.current.wave,
      (f) => {
        h.current.draw(f);
      }
    ), W = b(
      () => e.current.shouldPlay,
      (f) => c(!!f)
    ), S = b(
      () => e.current.isMuted,
      (f) => y(!!f)
    ), L = b(
      () => e.current.isLocked,
      (f) => {
        I(!!f), y(e.current.isMuted);
      }
    );
    return () => {
      p(), W(), S(), L();
    };
  }, [s]);
  const N = () => {
    e.current.togglePlay(), y(e.current.isMuted);
  }, P = () => {
    e.current.toggleMute();
  };
  return /* @__PURE__ */ C("div", { className: i, style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }, children: [
    /* @__PURE__ */ g(
      "div",
      {
        ref: l,
        onClick: N,
        style: {
          backgroundColor: "#121212",
          width: `${u}px`,
          height: `${t}px`,
          position: "relative",
          overflow: "hidden",
          ...a
        }
      }
    ),
    /* @__PURE__ */ g("div", { className: "flex gap-2 p-2", children: x ? /* @__PURE__ */ g("span", { className: "px-6 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 active:scale-95", children: "Click anywhere to unlock audio player" }) : /* @__PURE__ */ C(D, { children: [
      /* @__PURE__ */ g("button", { onClick: N, className: "px-6 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 active:scale-95", children: o ? "Pause" : "Play" }),
      /* @__PURE__ */ g("button", { onClick: P, className: "px-6 py-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 active:scale-95", children: m ? "Unmute" : "Mute" })
    ] }) })
  ] });
});
export {
  K as WaveAnimReact,
  K as default
};
//# sourceMappingURL=index.js.map
