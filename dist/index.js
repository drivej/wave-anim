import { jsx as P } from "react/jsx-runtime";
import { makeObservable as $, observable as y, action as u, reaction as g } from "mobx";
import { forwardRef as T, useRef as x, useImperativeHandle as A, useEffect as v, useState as m } from "react";
import { Howl as L, Howler as f } from "howler";
import { debounce as W } from "lodash";
const k = 64, d = Array(k).fill(0), C = 10, N = 0.85, I = -80, S = -10, E = Math.pow(2, 11);
class D {
  constructor() {
    this.bufferLength = 0, this.dataArray = new Uint8Array(), this.wave = d, this.fullWave = d, this.built = !1, this.nodesConnected = !1, this.howlId = -1, this.src = "", this.loaded = !1, this.isLoading = !1, this.shouldPlay = !1, this.throttle = 100, this.isMuted = !1, this.isLocked = !0, this.play = W(() => {
      this.howl && (this.shouldPlay = !0, !this.howl.playing(this.howlId) && (this.howl.play(this.howlId), this.buildNodes(), this.hijackBuffer()));
    }, 50), $(this, {
      wave: y,
      fullWave: y,
      getWaveData: u,
      updateWave: u,
      seek: u.bound,
      tick: u.bound,
      resetWave: u,
      loaded: y,
      isLoading: y,
      isMuted: y,
      toggleMute: u.bound,
      setMute: u.bound,
      shouldPlay: y,
      isLocked: y
    });
  }
  resetWave() {
    this.wave = d, this.fullWave = d;
  }
  setSource(t) {
    this.src !== t && (this.src = t, this.loaded = !1, this.isLoading = !0, this.stopTick(), this.howl && (this.howl.stop(), this.howl.unload()), this.resetWave(), this.nodesConnected = !1, this.built = !1, this.howl = new L({
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
      onload: u(() => {
        this.fullWave = this.getFullWave(), this.loaded = !0, this.isLoading = !1, this.shouldPlay && this.play();
      }),
      onend: u(() => {
        this.wave = d, this.shouldPlay = !1;
      }),
      onunlock: u(() => {
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
    this.gainNode && this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : 1, f.ctx.currentTime);
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
    }, this.throttle / C);
  }
  stopTick() {
    this.tickTimeout && clearTimeout(this.tickTimeout), this.requestFrame && cancelAnimationFrame(this.requestFrame);
  }
  hijackBuffer() {
    const t = this.howl._sounds?.[0]?._node;
    t?.bufferSource?.disconnect(), t?.bufferSource?.connect(this.analyserNode), this.nodesConnected || (this.analyserNode?.connect(this.gainNode), this.gainNode?.connect(f.ctx.destination), this.nodesConnected = !0);
  }
  buildNodes() {
    this.built || (this.built = !0, this.analyserNode = f.ctx.createAnalyser(), this.analyserNode.minDecibels = I, this.analyserNode.maxDecibels = S, this.analyserNode.smoothingTimeConstant = N, this.analyserNode.fftSize = E, this.bufferLength = this.analyserNode.frequencyBinCount, this.dataArray = new Uint8Array(this.bufferLength), this.gainNode = f.ctx.createGain(), this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : 1, f.ctx.currentTime));
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
      for (; t-- && t > k && this.dataArray[t] === 0; ) ;
      return Array.from(this.dataArray.slice(0, t)).map((i) => i / 255);
    }
    return d;
  }
  getFullWave(t = 500) {
    const a = this.howl._sounds?.[0]?._node?.bufferSource?.buffer;
    if (!a) return d;
    const s = a.getChannelData(0), c = Math.floor(s.length / t);
    let r = [], e = 0, h = 0, n = 0, o = 0;
    const p = Math.abs;
    for (e = 0; e < t; e++) {
      for (n = 0, o = c * e, h = 0; h < c; h++)
        n += p(s[o + h]);
      r.push(n / c);
    }
    const b = Math.pow(Math.max(...r), -1);
    return r = r.map((w) => w * b), isNaN(r[0]) && (r = d), r;
  }
  destroy() {
    console.log("AudioWave destroy"), this.pause(), this.howl?.unload(), this.resetWave(), this.nodesConnected = !1, this.built = !1;
  }
}
class M {
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
  clipboard = new M();
  overlay = new M();
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
    let a = t * this.scaleDeltaX, s = i * this.scaleDeltaY, c = (t - a) * 0.5, r = (i - s) * 0.5, e = 1.1;
    this.ctx.globalAlpha = this.fadeRate, this.ctx.filter = `blur(${e}px) hue-rotate(${this.hue}deg)`, this.clipboard.clear(), this.clipboard.ctx.drawImage(this.$cvs, 0, 0), this.ctx.clearRect(0, 0, t, i), this.ctx.drawImage(this.clipboard.$cvs, 0, 0, t, i, c, r, a, s), this.ctx.restore();
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
    let r = t.length, e, h, n, o;
    for (this.clipboard.clear(), this.clipboard.ctx.fillStyle = this.waveColor, this.clipboard.ctx.beginPath(), this.clipboard.ctx.moveTo(i, s); r--; )
      e = t[r], h = Math.round(r * c), n = e * a, o = s - n * 0.5, this.clipboard.ctx.lineTo(h, o);
    this.clipboard.ctx.lineTo(0, s), this.clipboard.ctx.closePath(), this.clipboard.ctx.fill(), this.ctx.drawImage(this.clipboard.$cvs, 0, 0, i, s, 0, 0, i, s), this.ctx.translate(0, a - 1), this.ctx.scale(1, -1), this.ctx.drawImage(this.clipboard.$cvs, 0, 0, i, s, 0, 0, i, s);
  }
  drawBlob(t, i) {
    this.clear();
    var a = this.$cvs.width, s = this.$cvs.height, c = a / i;
    let r = -1, e, h, n, o;
    for (this.clipboard.clear(), this.clipboard.ctx.fillStyle = "#fff", this.clipboard.ctx.beginPath(), this.clipboard.ctx.moveTo(0, s * 0.5); r++ < i; )
      e = t[r], h = Math.round(r * c), n = e / 255 * s, o = s * 0.5 - n * 0.5, this.clipboard.ctx.lineTo(h, o);
    this.clipboard.ctx.lineTo(a, s * 0.5), this.clipboard.ctx.closePath(), this.clipboard.ctx.fill(), this.ctx.drawImage(this.clipboard.$cvs, 0, 0, a, s * 0.5, 0, 0, a, s * 0.5), this.ctx.translate(0, s - 1), this.ctx.scale(1, -1), this.ctx.drawImage(this.clipboard.$cvs, 0, 0, a, s * 0.5, 0, 0, a, s * 0.5);
  }
  setSize(t, i) {
    this.width = t, this.height = i, this.clipboard.setSize(t, i), this.clipboard.ctx.drawImage(this.$cvs, 0, 0, this.width, this.height, 0, 0, t, i), this.$cvs.width = t, this.$cvs.height = i, this.ctx.drawImage(this.clipboard.$cvs, 0, 0), this.ctx.fillStyle = this.waveColor, this.overlay.setSize(t, i), this.drawOverlay();
  }
}
const j = T(({ width: l, height: t, className: i, style: a, audioSrc: s, ...c }, r) => {
  const e = x(new D()), h = x(new _()), n = x(null);
  return A(r, () => ({
    play: () => e.current.play(),
    pause: () => e.current.pause(),
    togglePlay: () => e.current.togglePlay(),
    toggleMute: () => e.current.toggleMute(),
    setMute: (o) => e.current.setMute(o),
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
    subscribe: (o) => {
      const p = g(
        () => e.current.shouldPlay,
        () => o({
          isPlaying: e.current.shouldPlay,
          isMuted: e.current.isMuted,
          isLocked: e.current.isLocked
        })
      ), b = g(
        () => e.current.isMuted,
        () => o({
          isPlaying: e.current.shouldPlay,
          isMuted: e.current.isMuted,
          isLocked: e.current.isLocked
        })
      ), w = g(
        () => e.current.isLocked,
        () => o({
          isPlaying: e.current.shouldPlay,
          isMuted: e.current.isMuted,
          isLocked: e.current.isLocked
        })
      );
      return () => {
        p(), b(), w();
      };
    }
  })), v(() => {
    const o = n.current;
    o && (o.innerHTML = "", h.current.setSize(l, t), o.appendChild(h.current.$cvs), o.appendChild(h.current.overlay.$cvs), o.style.cursor = "pointer", Object.assign(h.current.overlay.$cvs.style, {
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
  }, []), v(() => {
    h.current.setSize(l, t);
  }, [l, t]), v(() => {
    if (!s) return;
    e.current.setSource(s), e.current.pause(), e.current.setMute(!0);
    const o = g(
      () => e.current.wave,
      (p) => {
        h.current.draw(p);
      }
    );
    return () => {
      o();
    };
  }, [s]), /* @__PURE__ */ P(
    "div",
    {
      ref: n,
      className: i,
      ...c,
      style: {
        backgroundColor: "#121212",
        width: `${l}px`,
        height: `${t}px`,
        position: "relative",
        overflow: "hidden",
        ...a
      }
    }
  );
}), G = (l) => {
  const [t, i] = m(!0), [a, s] = m(!0), [c, r] = m(!1);
  return v(() => l.current ? (i(l.current.isLocked), s(l.current.isMuted), r(l.current.isPlaying), l.current.setMute(!1), l.current.subscribe((h) => {
    r(h.isPlaying), s(h.isMuted), i(h.isLocked);
  })) : void 0, [l]), { isLocked: t, isMuted: a, isPlaying: c, togglePlay: l.current?.togglePlay, toggleMute: l.current?.toggleMute, destroy: l.current?.destroy };
};
export {
  j as WaveAnimReact,
  j as default,
  G as useWaveControls
};
//# sourceMappingURL=index.js.map
