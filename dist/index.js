import { jsxs as C, jsx as b, Fragment as L } from "react/jsx-runtime";
import { makeObservable as D, observable as v, action as n, reaction as g } from "mobx";
import { useRef as k, useState as $, useEffect as M } from "react";
import { Howl as E, Howler as w } from "howler";
import { debounce as F } from "lodash";
const A = 64, d = Array(A).fill(0), _ = 10, z = 0.85, B = -80, R = -10, j = Math.pow(2, 11);
class q {
  constructor() {
    this.bufferLength = 0, this.dataArray = new Uint8Array(), this.wave = d, this.fullWave = d, this.built = !1, this.nodesConnected = !1, this.howlId = -1, this.src = "", this.loaded = !1, this.isLoading = !1, this.shouldPlay = !1, this.throttle = 100, this.isMuted = !1, this.isLocked = !0, this.play = F(() => {
      this.howl && (this.shouldPlay = !0, !this.howl.playing(this.howlId) && (this.howl.play(this.howlId), this.buildNodes(), this.hijackBuffer()));
    }, 50), D(this, {
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
    this.src !== t && (this.src = t, this.loaded = !1, this.isLoading = !0, this.stopTick(), this.howl && (this.howl.stop(), this.howl.unload()), this.resetWave(), this.nodesConnected = !1, this.built = !1, this.howl = new E({
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
    }, this.throttle / _);
  }
  stopTick() {
    this.tickTimeout && clearTimeout(this.tickTimeout), this.requestFrame && cancelAnimationFrame(this.requestFrame);
  }
  hijackBuffer() {
    const t = this.howl._sounds?.[0]?._node;
    t?.bufferSource?.disconnect(), t?.bufferSource?.connect(this.analyserNode), this.nodesConnected || (this.analyserNode?.connect(this.gainNode), this.gainNode?.connect(w.ctx.destination), this.nodesConnected = !0);
  }
  buildNodes() {
    this.built || (this.built = !0, this.analyserNode = w.ctx.createAnalyser(), this.analyserNode.minDecibels = B, this.analyserNode.maxDecibels = R, this.analyserNode.smoothingTimeConstant = z, this.analyserNode.fftSize = j, this.bufferLength = this.analyserNode.frequencyBinCount, this.dataArray = new Uint8Array(this.bufferLength), this.gainNode = w.ctx.createGain(), this.gainNode.gain.setValueAtTime(1, 0));
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
      return Array.from(this.dataArray.slice(0, t)).map((s) => s / 255);
    }
    return d;
  }
  getFullWave(t = 500) {
    const a = this.howl._sounds?.[0]?._node?.bufferSource?.buffer;
    if (!a) return d;
    const e = a.getChannelData(0), h = Math.floor(e.length / t);
    let i = [], l = 0, o = 0, r = 0, c = 0;
    const y = Math.abs;
    for (l = 0; l < t; l++) {
      for (r = 0, c = h * l, o = 0; o < h; o++)
        r += y(e[c + o]);
      i.push(r / h);
    }
    const m = Math.pow(Math.max(...i), -1);
    return i = i.map((x) => x * m), isNaN(i[0]) && (i = d), i;
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
  setSize(t, s) {
    this.width = t, this.height = s, this.$cvs.width = t, this.$cvs.height = s;
  }
}
class O {
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
    let t = this.$cvs.width, s = this.$cvs.height;
    this.ctx.save();
    let a = t * this.scaleDeltaX, e = s * this.scaleDeltaY, h = (t - a) * 0.5, i = (s - e) * 0.5, l = 1.1;
    this.ctx.globalAlpha = this.fadeRate, this.ctx.filter = `blur(${l}px) hue-rotate(${this.hue}deg)`, this.clipboard.clear(), this.clipboard.ctx.drawImage(this.$cvs, 0, 0), this.ctx.clearRect(0, 0, t, s), this.ctx.drawImage(this.clipboard.$cvs, 0, 0, t, s, h, i, a, e), this.ctx.restore();
  }
  drawOverlay() {
    this.overlay.clear();
    let t = this.overlay.height, s = this.overlay.width, a = 2;
    this.overlay.ctx.fillStyle = "#000";
    for (var e = 0; e < s; e += a * 2)
      this.overlay.ctx.fillRect(e, 0, a, t);
  }
  draw(t) {
    this.clear();
    var s = this.$cvs.width, a = this.$cvs.height, e = a * 0.5, h = s / t.length;
    let i = t.length, l, o, r, c;
    for (this.clipboard.clear(), this.clipboard.ctx.fillStyle = this.waveColor, this.clipboard.ctx.beginPath(), this.clipboard.ctx.moveTo(s, e); i--; )
      l = t[i], o = Math.round(i * h), r = l * a, c = e - r * 0.5, this.clipboard.ctx.lineTo(o, c);
    this.clipboard.ctx.lineTo(0, e), this.clipboard.ctx.closePath(), this.clipboard.ctx.fill(), this.ctx.drawImage(this.clipboard.$cvs, 0, 0, s, e, 0, 0, s, e), this.ctx.translate(0, a - 1), this.ctx.scale(1, -1), this.ctx.drawImage(this.clipboard.$cvs, 0, 0, s, e, 0, 0, s, e);
  }
  drawBlob(t, s) {
    this.clear();
    var a = this.$cvs.width, e = this.$cvs.height, h = a / s;
    let i = -1, l, o, r, c;
    for (this.clipboard.clear(), this.clipboard.ctx.fillStyle = "#fff", this.clipboard.ctx.beginPath(), this.clipboard.ctx.moveTo(0, e * 0.5); i++ < s; )
      l = t[i], o = Math.round(i * h), r = l / 255 * e, c = e * 0.5 - r * 0.5, this.clipboard.ctx.lineTo(o, c);
    this.clipboard.ctx.lineTo(a, e * 0.5), this.clipboard.ctx.closePath(), this.clipboard.ctx.fill(), this.ctx.drawImage(this.clipboard.$cvs, 0, 0, a, e * 0.5, 0, 0, a, e * 0.5), this.ctx.translate(0, e - 1), this.ctx.scale(1, -1), this.ctx.drawImage(this.clipboard.$cvs, 0, 0, a, e * 0.5, 0, 0, a, e * 0.5);
  }
  setSize(t, s) {
    this.width = t, this.height = s, this.clipboard.setSize(t, s), this.clipboard.ctx.drawImage(this.$cvs, 0, 0, this.width, this.height, 0, 0, t, s), this.$cvs.width = t, this.$cvs.height = s, this.ctx.drawImage(this.clipboard.$cvs, 0, 0), this.ctx.fillStyle = this.waveColor, this.overlay.setSize(t, s), this.drawOverlay();
  }
}
const Y = ({ width: u, height: t, className: s, style: a, audioSrc: e }) => {
  const h = k(new q()), i = k(new O()), l = k(null), [o, r] = $(!1), [c, y] = $(!0), [m, x] = $(!0);
  M(() => {
    const f = l.current;
    f && (f.innerHTML = "", i.current.setSize(u, t), f.appendChild(i.current.$cvs), f.appendChild(i.current.overlay.$cvs), f.style.cursor = "pointer", Object.assign(i.current.overlay.$cvs.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none"
    }), Object.assign(i.current.$cvs.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%"
    }));
  }, []), M(() => {
    i.current.setSize(u, t);
  }, [u, t]), M(() => {
    if (!e) return;
    h.current.setSource(e), h.current.pause(), h.current.setMute(!0);
    const f = g(
      () => h.current.wave,
      (p) => {
        i.current.draw(p);
      }
    ), W = g(
      () => h.current.shouldPlay,
      (p) => r(!!p)
    ), S = g(
      () => h.current.isMuted,
      (p) => y(!!p)
    ), P = g(
      () => h.current.isLocked,
      (p) => {
        x(!!p), y(h.current.isMuted);
      }
    );
    return () => {
      f(), W(), S(), P();
    };
  }, [e]);
  const N = () => {
    h.current.togglePlay(), y(h.current.isMuted);
  }, I = () => {
    h.current.toggleMute();
  };
  return /* @__PURE__ */ C("div", { className: s, style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }, children: [
    /* @__PURE__ */ b(
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
    /* @__PURE__ */ b("div", { className: "flex gap-2 p-2", children: m ? /* @__PURE__ */ b("span", { className: "px-6 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 active:scale-95", children: "Click anywhere to unlock audio player" }) : /* @__PURE__ */ C(L, { children: [
      /* @__PURE__ */ b("button", { onClick: N, className: "px-6 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 active:scale-95", children: o ? "Pause" : "Play" }),
      /* @__PURE__ */ b("button", { onClick: I, className: "px-6 py-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 active:scale-95", children: c ? "Unmute" : "Mute" })
    ] }) })
  ] });
};
export {
  Y as WaveAnimReact,
  Y as default
};
//# sourceMappingURL=index.js.map
