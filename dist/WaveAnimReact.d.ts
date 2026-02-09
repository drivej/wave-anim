import React from 'react';
export interface WaveAnimReactProps extends React.HTMLAttributes<HTMLDivElement> {
    width: number;
    height: number;
    audioSrc?: string;
}
export type WaveAnimHandle = {
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    toggleMute: () => void;
    setMute: (muted: boolean) => void;
    isPlaying: boolean;
    isMuted: boolean;
    isLocked: boolean;
    destroy: () => void;
    subscribe: (callback: (state: {
        isPlaying: boolean;
        isMuted: boolean;
        isLocked: boolean;
    }) => void) => () => void;
};
export declare const WaveAnimReact: React.ForwardRefExoticComponent<WaveAnimReactProps & React.RefAttributes<WaveAnimHandle>>;
export declare const useWaveControls: (waveRef: React.RefObject<WaveAnimHandle>) => {
    isLocked: boolean;
    isMuted: boolean;
    isPlaying: boolean;
    togglePlay: (() => void) | undefined;
    toggleMute: (() => void) | undefined;
    destroy: (() => void) | undefined;
};
//# sourceMappingURL=WaveAnimReact.d.ts.map