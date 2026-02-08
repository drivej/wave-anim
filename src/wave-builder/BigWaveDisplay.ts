// import { reaction } from 'mobx';
// import { AudioWave } from '../audio-wave/AudioWave';
// import WaveCanvas from './WaveCanvas';

// export class BigWaveDisplay {
//   audioWave = new AudioWave();
//   waveCanvas = new WaveCanvas();
//   audioSrc?: string;

//   constructor(config: { container: HTMLElement; width: number; height: number; audioSrc?: string }) {
//     console.log('BigWaveDisplay constructor', config);
//     this.audioSrc = config.audioSrc;

//     config.container.appendChild(this.waveCanvas.$cvs);
//     config.container.appendChild(this.waveCanvas.overlay.$cvs);

//     config.container.style.background = '#121212';
//     config.container.style.overflow = 'hidden';
//     config.container.style.width = `${config.width}px`;
//     config.container.style.height = `${config.height}px`;

//     Object.assign(this.waveCanvas.$cvs.style, {
//       position: 'absolute',
//       inset: 0,
//       width: '100%',
//       height: '100%',
//       cursor: 'pointer'
//     });

//     Object.assign(this.waveCanvas.overlay.$cvs.style, {
//       position: 'absolute',
//       inset: 0,
//       width: '100%',
//       height: '100%',
//       display: 'none',
//       pointerEvents: 'none' // Allow clicks to pass through to the main canvas
//     });

//     this.waveCanvas.setSize(config.width, config.height);

//     // Add click listener to the canvas (which is on top)
//     this.waveCanvas.$cvs.addEventListener('click', () => {
//       console.log('togglePlay', this.audioWave.shouldPlay);
//       // this.togglePlay();
//       this.audioWave.togglePlay();
//     });

//     reaction(
//       () => this.audioWave.wave,
//       (wave) => {
//         // this.clipIndex = this.bufferLength * clipPercent;
//         this.waveCanvas.draw(wave);
//       }
//     );

//     this.init();
//   }

//   togglePlay() {
//     console.log('togglePlay', this.audioWave.shouldPlay);
//     this.audioWave.shouldPlay ? this.audioWave.pause() : this.audioWave.play();
//   }

//   init() {
//     if (this.audioSrc) {
//       this.audioWave.setSource(this.audioSrc);
//       this.audioWave.play();
//       this.audioWave.setMute(true);
//     }
//   }

//   pause() {
//     this.audioWave.pause();
//   }

//   play() {
//     this.audioWave.play();
//   }

//   destroy() {
//     console.log('BigWaveDisplay destroy');
//     this.audioWave.pause();
//     this.audioWave.stopTick();
//     if (this.audioWave.howl) {
//       this.audioWave.howl.stop();
//       this.audioWave.howl.unload();
//     }
//   }

//   setSize(width: number, height: number) {
//     this.waveCanvas.setSize(width, height);
//   }

//   setAudioSrc(src: string) {
//     // Only update if the source has changed
//     if (this.audioSrc === src) return;
//     this.audioSrc = src;
//     this.audioWave.setSource(src);
//   }
// }
