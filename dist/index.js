import { jsx as P } from "react/jsx-runtime";
import { makeObservable as L, observable as g, action as d, reaction as f } from "mobx";
import { forwardRef as $, useRef as x, useImperativeHandle as T, useEffect as v, useState as m } from "react";
import { Howler as n, Howl as I } from "howler";
import { debounce as A } from "lodash";
const M = 64, y = Array(M).fill(0), N = 10, W = 0.85, C = -80, S = -10, E = Math.pow(2, 11);
class D {
  constructor() {
    this.bufferLength = 0, this.dataArray = new Uint8Array(), this.wave = y, this.fullWave = y, this.built = !1, this.nodesConnected = !1, this.howlId = -1, this.src = "", this.loaded = !1, this.isLoading = !1, this.shouldPlay = !1, this.throttle = 100, this.isMuted = !1, this.isLocked = !0, this.play = A(() => {
      if (this.howl) {
        if (console.log("wave.play(), howlId:", this.howlId), this.shouldPlay = !0, this.howl.playing(this.howlId)) {
          console.log("already playing, skipping");
          return;
        }
        this.howl.play(this.howlId), this.buildNodes(), this.hijackBuffer(), setTimeout(() => {
          n.ctx && n.ctx.state === "running" && this.isLocked && (this.isLocked = !1);
        }, 100);
      }
    }, 50), L(this, {
      wave: g,
      fullWave: g,
      getWaveData: d,
      updateWave: d,
      seek: d.bound,
      tick: d.bound,
      resetWave: d,
      loaded: g,
      isLoading: g,
      isMuted: g,
      toggleMute: d.bound,
      setMute: d.bound,
      shouldPlay: g,
      isLocked: g
    }), n.ctx && n.ctx.state === "running" && (this.isLocked = !1);
  }
  resetWave() {
    this.wave = y, this.fullWave = y;
  }
  setSource(t) {
    this.src !== t && (this.src = t, this.loaded = !1, this.isLoading = !0, console.log("wave.setSource()"), this.stopTick(), this.howl && (this.howl.stop(), this.howl.unload()), this.resetWave(), this.nodesConnected = !1, this.built = !1, this.howl = new I({
      src: t,
      autoplay: !1,
      mute: !1,
      html5: !1,
      // Use Web Audio API for better control
      onplay: () => {
        console.log("howl.onplay, shouldPlay:", this.shouldPlay), this.shouldPlay ? (this.buildNodes(), this.hijackBuffer(), this.startTick()) : this.pause();
      },
      onpause: () => {
        console.log("howl.onpause, shouldPlay:", this.shouldPlay), this.shouldPlay ? this.play() : this.stopTick();
      },
      onload: d(() => {
        console.log("howl.onload, shouldPlay:", this.shouldPlay), this.fullWave = this.getFullWave(), this.loaded = !0, this.isLoading = !1, this.shouldPlay && this.play(), n.ctx && n.ctx.state === "running" && (this.isLocked = !1);
      }),
      onend: d(() => {
        console.log("howl.onend"), this.wave = y, this.shouldPlay = !1;
      }),
      onunlock: d(() => {
        console.log("unlock"), this.isLocked = !1;
      })
    }), this.howlId = this.howl.play(), this.howl.pause(this.howlId), n.ctx && n.ctx.state === "running" && (this.isLocked = !1));
  }
  pause() {
    this.howl && (console.log("wave.pause(), howlId:", this.howlId), this.shouldPlay = !1, this.stopTick(), this.play?.cancel(), this.howl.pause(this.howlId));
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
    this.gainNode && this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : 1, n.ctx.currentTime);
  }
  seek(t = 0) {
    console.log("wave.seek()"), this.howl.pause(this.howlId), this.howl.seek(t, this.howlId);
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
    }, this.throttle / N);
  }
  stopTick() {
    this.tickTimeout && clearTimeout(this.tickTimeout), this.requestFrame && cancelAnimationFrame(this.requestFrame);
  }
  hijackBuffer() {
    console.log("hijackBuffer");
    const t = this.howl._sounds?.[0]?._node;
    t?.bufferSource?.disconnect(), t?.bufferSource?.connect(this.analyserNode), this.nodesConnected || (this.analyserNode?.connect(this.gainNode), this.gainNode?.connect(n.ctx.destination), this.nodesConnected = !0);
  }
  buildNodes() {
    this.built || (console.log("buildNodes"), this.built = !0, this.analyserNode = n.ctx.createAnalyser(), this.analyserNode.minDecibels = C, this.analyserNode.maxDecibels = S, this.analyserNode.smoothingTimeConstant = W, this.analyserNode.fftSize = E, this.bufferLength = this.analyserNode.frequencyBinCount, this.dataArray = new Uint8Array(this.bufferLength), this.gainNode = n.ctx.createGain(), this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : 1, n.ctx.currentTime));
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
      for (; t-- && t > M && this.dataArray[t] === 0; ) ;
      return Array.from(this.dataArray.slice(0, t)).map((i) => i / 255);
    }
    return y;
  }
  getFullWave(t = 500) {
    const a = this.howl._sounds?.[0]?._node?.bufferSource?.buffer;
    if (!a) return y;
    const s = a.getChannelData(0), c = Math.floor(s.length / t);
    let o = [], e = 0, r = 0, u = 0, l = 0;
    const p = Math.abs;
    for (e = 0; e < t; e++) {
      for (u = 0, l = c * e, r = 0; r < c; r++)
        u += p(s[l + r]);
      o.push(u / c);
    }
    const w = Math.pow(Math.max(...o), -1);
    return o = o.map((b) => b * w), isNaN(o[0]) && (o = y), o;
  }
  destroy() {
    console.log("AudioWave destroy"), this.howl.stop();
  }
}
class k {
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
class _ {
  clipboard = new k();
  overlay = new k();
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
    let a = t * this.scaleDeltaX, s = i * this.scaleDeltaY, c = (t - a) * 0.5, o = (i - s) * 0.5, e = 1.1;
    this.ctx.globalAlpha = this.fadeRate, this.ctx.filter = `blur(${e}px) hue-rotate(${this.hue}deg)`, this.clipboard.clear(), this.clipboard.ctx.drawImage(this.$cvs, 0, 0), this.ctx.clearRect(0, 0, t, i), this.ctx.drawImage(this.clipboard.$cvs, 0, 0, t, i, c, o, a, s), this.ctx.restore();
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
    var i = this.$cvs.width, a = this.$cvs.height, s = a * 0.5, c = i / t.length;
    let o = t.length, e, r, u, l;
    for (this.clipboard.clear(), this.clipboard.ctx.fillStyle = this.waveColor, this.clipboard.ctx.beginPath(), this.clipboard.ctx.moveTo(i, s); o--; )
      e = t[o], r = Math.round(o * c), u = e * a, l = s - u * 0.5, this.clipboard.ctx.lineTo(r, l);
    this.clipboard.ctx.lineTo(0, s), this.clipboard.ctx.closePath(), this.clipboard.ctx.fill(), this.ctx.drawImage(this.clipboard.$cvs, 0, 0, i, s, 0, 0, i, s), this.ctx.translate(0, a - 1), this.ctx.scale(1, -1), this.ctx.drawImage(this.clipboard.$cvs, 0, 0, i, s, 0, 0, i, s);
  }
  drawBlob(t, i) {
    this.clear();
    var a = this.$cvs.width, s = this.$cvs.height, c = a / i;
    let o = -1, e, r, u, l;
    for (this.clipboard.clear(), this.clipboard.ctx.fillStyle = "#fff", this.clipboard.ctx.beginPath(), this.clipboard.ctx.moveTo(0, s * 0.5); o++ < i; )
      e = t[o], r = Math.round(o * c), u = e / 255 * s, l = s * 0.5 - u * 0.5, this.clipboard.ctx.lineTo(r, l);
    this.clipboard.ctx.lineTo(a, s * 0.5), this.clipboard.ctx.closePath(), this.clipboard.ctx.fill(), this.ctx.drawImage(this.clipboard.$cvs, 0, 0, a, s * 0.5, 0, 0, a, s * 0.5), this.ctx.translate(0, s - 1), this.ctx.scale(1, -1), this.ctx.drawImage(this.clipboard.$cvs, 0, 0, a, s * 0.5, 0, 0, a, s * 0.5);
  }
  setSize(t, i) {
    this.width = t, this.height = i, this.clipboard.setSize(t, i), this.clipboard.ctx.drawImage(this.$cvs, 0, 0, this.width, this.height, 0, 0, t, i), this.$cvs.width = t, this.$cvs.height = i, this.ctx.drawImage(this.clipboard.$cvs, 0, 0), this.ctx.fillStyle = this.waveColor, this.overlay.setSize(t, i), this.drawOverlay();
  }
}
const j = $(({ width: h, height: t, className: i, style: a, audioSrc: s, ...c }, o) => {
  const e = x(new D()), r = x(new _()), u = x(null);
  return T(o, () => ({
    play: () => e.current.play(),
    pause: () => e.current.pause(),
    togglePlay: () => e.current.togglePlay(),
    toggleMute: () => e.current.toggleMute(),
    setMute: (l) => e.current.setMute(l),
    destroy: () => e.current.destroy(),
    get isPlaying() {
      return e.current.shouldPlay;
    },
    get isMuted() {
      return e.current.isMuted;
    },
    get isLocked() {
      return e.current.isLocked;
    },
    subscribe: (l) => {
      const p = f(
        () => e.current.shouldPlay,
        () => l({
          isPlaying: e.current.shouldPlay,
          isMuted: e.current.isMuted,
          isLocked: e.current.isLocked
        })
      ), w = f(
        () => e.current.isMuted,
        () => l({
          isPlaying: e.current.shouldPlay,
          isMuted: e.current.isMuted,
          isLocked: e.current.isLocked
        })
      ), b = f(
        () => e.current.isLocked,
        () => l({
          isPlaying: e.current.shouldPlay,
          isMuted: e.current.isMuted,
          isLocked: e.current.isLocked
        })
      );
      return () => {
        p(), w(), b();
      };
    }
  })), v(() => {
    const l = u.current;
    l && (l.innerHTML = "", r.current.setSize(h, t), l.appendChild(r.current.$cvs), l.appendChild(r.current.overlay.$cvs), l.style.cursor = "pointer", Object.assign(r.current.overlay.$cvs.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none"
    }), Object.assign(r.current.$cvs.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%"
    }));
  }, []), v(() => {
    r.current.setSize(h, t);
  }, [h, t]), v(() => {
    if (!s) return;
    e.current.setSource(s), e.current.pause(), e.current.setMute(!0);
    const l = f(
      () => e.current.wave,
      (p) => {
        r.current.draw(p);
      }
    );
    return () => {
      l(), e.current.destroy();
    };
  }, [s]), /* @__PURE__ */ P(
    "div",
    {
      ref: u,
      className: i,
      ...c,
      style: {
        backgroundColor: "#121212",
        width: `${h}px`,
        height: `${t}px`,
        position: "relative",
        overflow: "hidden",
        ...a
      }
    }
  );
}), G = (h) => {
  const [t, i] = m(!0), [a, s] = m(!0), [c, o] = m(!1);
  return v(() => h.current ? (i(h.current.isLocked), s(h.current.isMuted), o(h.current.isPlaying), h.current.setMute(!1), h.current.subscribe((r) => {
    o(r.isPlaying), s(r.isMuted), i(r.isLocked);
  })) : void 0, [h]), {
    isLocked: t,
    //
    isMuted: a,
    isPlaying: c,
    togglePlay: h.current?.togglePlay,
    toggleMute: h.current?.toggleMute,
    destroy: h.current?.destroy,
    play: h.current?.play,
    pause: h.current?.pause
  };
};
export {
  j as WaveAnimReact,
  j as default,
  G as useWaveControls
};
//# sourceMappingURL=index.js.map
