import { Howl } from 'howler';
import { IAudioWave, WaveModel } from './IAudioPlayer';
export declare class AudioWave implements IAudioWave {
    source: MediaElementAudioSourceNode;
    analyserNode: AnalyserNode | undefined;
    gainNode: GainNode;
    buffer: AudioBuffer;
    bufferData: unknown;
    bufferLength: number;
    dataArray: Uint8Array<ArrayBuffer>;
    wave: WaveModel;
    fullWave: WaveModel;
    tickTimeout: NodeJS.Timeout;
    requestFrame: number;
    built: boolean;
    nodesConnected: boolean;
    howl: Howl & {
        _sounds?: {
            _node: GainNode & {
                bufferSource: AudioBufferSourceNode;
            };
        }[];
    };
    howlId: number;
    src: string;
    loaded: boolean;
    isLoading: boolean;
    shouldPlay: boolean;
    throttle: number;
    isMuted: boolean;
    isLocked: boolean;
    constructor();
    resetWave(): void;
    setSource(src: string): void;
    play: import("lodash").DebouncedFunc<() => void>;
    pause(): void;
    togglePlay(): void;
    toggleMute(): void;
    setMute(muted: boolean): void;
    updateGain(): void;
    seek(position?: number): void;
    setPlaybackRate(n: number): void;
    startTick(): void;
    tick(): void;
    stopTick(): void;
    hijackBuffer(): void;
    buildNodes(): void;
    updateWave(): void;
    getRawWave(): Uint8Array<ArrayBuffer>;
    getWaveData(): WaveModel;
    getFullWave(samples?: number): WaveModel;
}
//# sourceMappingURL=AudioWave.d.ts.map