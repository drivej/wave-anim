import { reaction } from 'mobx';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AudioWave } from './audio-wave/AudioWave.js';
import WaveCanvas from './wave-builder/WaveCanvas.js';

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
  subscribe: (callback: (state: { isPlaying: boolean; isMuted: boolean; isLocked: boolean }) => void) => () => void;
};

export const WaveAnimReact = forwardRef<WaveAnimHandle, WaveAnimReactProps>(({ width, height, className, style, audioSrc, ...rest }, ref) => {
  const audioWave = useRef(new AudioWave());
  const waveCanvas = useRef(new WaveCanvas());
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    play: () => audioWave.current.play(),
    pause: () => audioWave.current.pause(),
    togglePlay: () => audioWave.current.togglePlay(),
    toggleMute: () => audioWave.current.toggleMute(),
    setMute: (muted: boolean) => audioWave.current.setMute(muted),
    destroy: () => audioWave.current.destroy(),
    get isPlaying() {
      return audioWave.current.shouldPlay;
    },
    get isMuted() {
      return audioWave.current.isMuted;
    },
    get isLocked() {
      return audioWave.current.isLocked;
    },
    subscribe: (callback) => {
      const disposePlay = reaction(
        () => audioWave.current.shouldPlay,
        () =>
          callback({
            isPlaying: audioWave.current.shouldPlay,
            isMuted: audioWave.current.isMuted,
            isLocked: audioWave.current.isLocked
          })
      );

      const disposeMute = reaction(
        () => audioWave.current.isMuted,
        () =>
          callback({
            isPlaying: audioWave.current.shouldPlay,
            isMuted: audioWave.current.isMuted,
            isLocked: audioWave.current.isLocked
          })
      );

      const disposeLock = reaction(
        () => audioWave.current.isLocked,
        () =>
          callback({
            isPlaying: audioWave.current.shouldPlay,
            isMuted: audioWave.current.isMuted,
            isLocked: audioWave.current.isLocked
          })
      );

      // Return unsubscribe function
      return () => {
        disposePlay();
        disposeMute();
        disposeLock();
      };
    }
  }));

  // Init/attach canvases once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Ensure container is empty (prevents duplicate canvases)
    container.innerHTML = '';

    waveCanvas.current.setSize(width, height);
    container.appendChild(waveCanvas.current.$cvs);
    container.appendChild(waveCanvas.current.overlay.$cvs);

    // Put cursor on container (since overlay won't receive pointer events)
    container.style.cursor = 'pointer';

    // Overlay should not block clicks
    Object.assign(waveCanvas.current.overlay.$cvs.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none'
    });

    // Optional: make sure base canvas fills container
    Object.assign(waveCanvas.current.$cvs.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%'
    });
  }, []); // only once

  // Keep size updated
  useEffect(() => {
    waveCanvas.current.setSize(width, height);
  }, [width, height]);

  // Audio source setup + mobx reactions with cleanup
  useEffect(() => {
    if (!audioSrc) return;

    audioWave.current.setSource(audioSrc);
    audioWave.current.pause();
    audioWave.current.setMute(true);

    const disposeWave = reaction(
      () => audioWave.current.wave,
      (wave) => {
        waveCanvas.current.draw(wave);
      }
    );

    return () => {
      disposeWave();
      audioWave.current.destroy();
    };
  }, [audioSrc]);

  return (
    <div
      ref={containerRef}
      className={className}
      {...rest}
      style={{
        backgroundColor: '#121212',
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    />
  );
});

export const useWaveControls = (waveRef: React.RefObject<WaveAnimHandle>) => {
  const [isLocked, setIsLocked] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!waveRef.current) return;
    setIsLocked(waveRef.current.isLocked);
    setIsMuted(waveRef.current.isMuted);
    setIsPlaying(waveRef.current.isPlaying);
    waveRef.current.setMute(false);
    const unsubscribe = waveRef.current.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setIsMuted(state.isMuted);
      setIsLocked(state.isLocked);
    });
    return unsubscribe;
  }, [waveRef]);

  return {
    isLocked, //
    isMuted,
    isPlaying,
    togglePlay: waveRef.current?.togglePlay,
    toggleMute: waveRef.current?.toggleMute,
    destroy: waveRef.current?.destroy,
    play: waveRef.current?.play,
    pause: waveRef.current?.pause
  };
};
