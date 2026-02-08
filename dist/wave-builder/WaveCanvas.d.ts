export default class WaveCanvas {
    constructor(config: any);
    clipboard: CanvasClipboard;
    overlay: CanvasClipboard;
    $cvs: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    wave: any[];
    nextWave: any[];
    requestFrame: any;
    scaleDeltaX: number;
    scaleDeltaY: number;
    fadeRate: number;
    width: number;
    height: number;
    waveColor: string;
    hue: number;
    $clipboard: HTMLCanvasElement;
    clipboard_ctx: CanvasRenderingContext2D | null;
    clear(): void;
    drawOverlay(): void;
    draw(wave: any): void;
    drawBlob(wave: any, clipIndex: any): void;
    setSize(w: any, h: any): void;
}
import CanvasClipboard from './CanvasClipboard';
//# sourceMappingURL=WaveCanvas.d.ts.map