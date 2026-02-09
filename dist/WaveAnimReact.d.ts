import React from 'react';
export interface WaveAnimReactProps {
    width: number;
    height: number;
    className?: string;
    style?: React.CSSProperties;
    audioSrc?: string;
}
export type WaveAnimHandle = {
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    toggleMute: () => void;
    isPlaying: boolean;
    isMuted: boolean;
    isLocked: boolean;
};
export declare const WaveAnimReact: React.ForwardRefExoticComponent<WaveAnimReactProps & React.RefAttributes<WaveAnimHandle>>;
//# sourceMappingURL=WaveAnimReact.d.ts.map