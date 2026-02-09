import { Howl, Howler } from 'howler';
import { debounce } from 'lodash';
import { action, makeObservable, observable } from 'mobx';
import { IAudioWave, WaveModel } from './IAudioPlayer';
/*

There's a balance between the WAVE_FPS (frames per second) of the analyser node render, the analyser SMOOTHING_TIME_CONSTANT, and the css:transition that shows the wave
We can get away with a low frame rate by animating the transition in the wave
Theoretically, the sound processing is more intensive than the animation

*/
const debug = false;

const MIN_WAVE_ARRAY_LENGTH = 64;
const DEFAULT_WAVE = Array(MIN_WAVE_ARRAY_LENGTH).fill(0);
const WAVE_FPS = 10;
const SMOOTHING_TIME_CONSTANT = 0.85;
const MIN_DECIBELS = -80;
const MAX_DECIBELS = -10;
const FFT_SIZE = Math.pow(2,11);//512;

export class AudioWave implements IAudioWave {
  source!: MediaElementAudioSourceNode;
  analyserNode: AnalyserNode | undefined;
  gainNode!: GainNode;
  buffer!: AudioBuffer;
  bufferData: unknown;
  bufferLength = 0;
  dataArray: Uint8Array<ArrayBuffer> = new Uint8Array();
  wave: WaveModel = DEFAULT_WAVE;
  fullWave: WaveModel = DEFAULT_WAVE;
  tickTimeout!: NodeJS.Timeout;
  requestFrame!: number;
  built = false;
  nodesConnected = false;
  howl!: Howl & { _sounds?: { _node: GainNode & { bufferSource: AudioBufferSourceNode } }[] };
  howlId = -1;
  src = '';
  loaded = false;
  isLoading = false;
  shouldPlay = false;
  throttle = 100;
  isMuted = false;
  isLocked = true;

  constructor() {
    makeObservable(this, {
      wave: observable,
      fullWave: observable,
      getWaveData: action,
      updateWave: action,
      seek: action.bound,
      tick: action.bound,
      resetWave: action,
      loaded: observable,
      isLoading: observable,
      isMuted: observable,
      toggleMute: action.bound,
      setMute: action.bound,
      shouldPlay: observable,
      isLocked: observable,
    });
  }

  resetWave(): void {
    this.wave = DEFAULT_WAVE;
    this.fullWave = DEFAULT_WAVE;
  }

  setSource(src: string): void {
    if (this.src === src) return;
    this.src = src;
    this.loaded = false;
    this.isLoading = true;
    if (debug) console.log('wave.setSource()');

    // Stop and unload previous audio
    this.stopTick();
    if (this.howl) {
      this.howl.stop();
      this.howl.unload();
    }
    this.resetWave();
    this.nodesConnected = false;
    this.built = false;

    this.howl = new Howl({
      src: src,
      autoplay: false,
      mute: false,
      html5: false, // Use Web Audio API for better control
      onplay: () => {
        if (debug) console.log('howl.onplay, shouldPlay:', this.shouldPlay);
        if (this.shouldPlay) {
          this.buildNodes();
          this.hijackBuffer();
          this.startTick();
        } else {
          this.pause();
        }
      },
      onpause: () => {
        if (debug) console.log('howl.onpause, shouldPlay:', this.shouldPlay);
        if (!this.shouldPlay) {
          this.stopTick();
        } else {
          this.play();
        }
      },
      onload: action(() => {
        if (debug) console.log('howl.onload, shouldPlay:', this.shouldPlay);
        this.fullWave = this.getFullWave();
        this.loaded = true;
        this.isLoading = false;
        if (this.shouldPlay) {
          this.play();
        }
      }),
      onend: action(() => {
        if (debug) console.log('howl.onend');
        this.wave = DEFAULT_WAVE;
        this.shouldPlay = false;
      }),
      onunlock: action(() => {
         if (debug) console.log('unlock');
         this.isLocked = false;
      })
    });

    // Create a single sound instance and keep its ID
    this.howlId = this.howl.play();
    this.howl.pause(this.howlId);
  }

  play = debounce(() => {
    if (!this.howl) return;
    if (debug) console.log('wave.play(), howlId:', this.howlId);
    this.shouldPlay = true;

    // If the sound is already playing, don't create a new one
    if (this.howl.playing(this.howlId)) {
      if (debug) console.log('already playing, skipping');
      return;
    }

    // Resume the existing sound
    this.howl.play(this.howlId);
    this.buildNodes();
    this.hijackBuffer();
  }, 50);

  pause(): void {
    if (!this.howl) return;
    if (debug) console.log('wave.pause(), howlId:', this.howlId);
    this.shouldPlay = false;
    this.stopTick();
    this.play?.cancel();
    this.howl.pause(this.howlId);
  }

  togglePlay(): void {
    this.shouldPlay ? this.pause() : this.play();
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.updateGain();
  }

  setMute(muted: boolean): void {
    this.isMuted = muted;
    this.updateGain();
  }

  updateGain(): void {
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : 1, Howler.ctx.currentTime);
    }
  }

  seek(position = 0): void {
    if (debug) console.log('wave.seek()');
    this.howl.pause(this.howlId);
    this.howl.seek(position, this.howlId);
  }

  setPlaybackRate(n: number): void {
    this.howl.rate(n, this.howlId);
  }

  startTick(): void {
    this.stopTick();
    this.tick();
  }

  tick(): void {
    this.tickTimeout = setTimeout(() => {
      this.updateWave();
      this.requestFrame = requestAnimationFrame(this.tick);
    }, this.throttle / WAVE_FPS);
  }

  stopTick(): void {
    if (this.tickTimeout) clearTimeout(this.tickTimeout);
    if (this.requestFrame) cancelAnimationFrame(this.requestFrame);
  }

  hijackBuffer(): void {
    // the trickery here is to capture the wave before the volume so the wave will show even if the volume is 0 or muted
    if (debug) console.log('hijackBuffer');
    const node = this.howl._sounds?.[0]?._node;
    node?.bufferSource?.disconnect();
    node?.bufferSource?.connect(this.analyserNode!);

    // Only connect analyser and gain nodes once to avoid multiple audio streams
    if (!this.nodesConnected) {
      this.analyserNode?.connect(this.gainNode);
      this.gainNode?.connect(Howler.ctx.destination);
      this.nodesConnected = true;
    }
  }

  buildNodes(): void {
    if (!this.built) {
      if (debug) console.log('buildNodes');
      this.built = true;
      this.analyserNode = Howler.ctx.createAnalyser();
      this.analyserNode.minDecibels = MIN_DECIBELS;
      this.analyserNode.maxDecibels = MAX_DECIBELS;
      this.analyserNode.smoothingTimeConstant = SMOOTHING_TIME_CONSTANT;
      this.analyserNode.fftSize = FFT_SIZE;
      this.bufferLength = this.analyserNode.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
      this.gainNode = Howler.ctx.createGain();
      // Initialize gain based on current mute state
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : 1, Howler.ctx.currentTime);
    }
  }

  updateWave(): void {
    this.wave = this.getWaveData();
  }

  getRawWave(){
    this.analyserNode!.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  getWaveData(): WaveModel {
    if (this.analyserNode) {
      this.analyserNode.getByteFrequencyData(this.dataArray);
      // return this.dataArray;
      let i = this.dataArray.length;
      // trim off zeros at the end of this array to focus on the active part of the wave
      while (i-- && i > MIN_WAVE_ARRAY_LENGTH && this.dataArray[i] === 0);
      // convert array values from 0-255 int to 0-1 float
      return Array.from(this.dataArray.slice(0, i)).map((n: number) => n / 255);
    }
    return DEFAULT_WAVE;
  }

  getFullWave(samples = 500): WaveModel {
    // ref: https://css-tricks.com/making-an-audio-waveform-visualizer-with-vanilla-javascript/
    const node = this.howl._sounds?.[0]?._node;
    const buffer = node?.bufferSource?.buffer;
    if (!buffer) return DEFAULT_WAVE;
    const a = buffer.getChannelData(0);
    const chunkSize = Math.floor(a.length / samples);

    let chunks = [];
    let i = 0;
    let ii = 0;
    let sum = 0;
    let chunkStart = 0;
    const abs = Math.abs;

    for (i = 0; i < samples; i++) {
      sum = 0;
      chunkStart = chunkSize * i;
      for (ii = 0; ii < chunkSize; ii++) {
        sum += abs(a[chunkStart + ii]);
      }
      chunks.push(sum / chunkSize);
    }

    const multiplier = Math.pow(Math.max(...chunks), -1);
    chunks = chunks.map((n: number) => n * multiplier);

    // was one scenario where all values were coming back as NaN - who knows but here's a cheap check for it
    if (isNaN(chunks[0])) {
      chunks = DEFAULT_WAVE;
    }
    return chunks;
  }
}
