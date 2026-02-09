import { reaction } from 'mobx';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AudioWave } from './audio-wave/AudioWave.js';
import WaveCanvas from './wave-builder/WaveCanvas.js';

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

export const WaveAnimReact = forwardRef<WaveAnimHandle, WaveAnimReactProps>(({ width, height, className, style, audioSrc }, ref) => {
  const audioWave = useRef(new AudioWave());
  const waveCanvas = useRef(new WaveCanvas());
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLocked, setIsLocked] = useState(true);

  useImperativeHandle(ref, () => ({
    play: () => audioWave.current.play(),
    pause: () => audioWave.current.pause(),
    togglePlay: () => audioWave.current.togglePlay(),
    toggleMute: () => audioWave.current.toggleMute(),
    get isPlaying() {
      return audioWave.current.shouldPlay;
    },
    get isMuted() {
      return audioWave.current.isMuted;
    },
    get isLocked() {
      return audioWave.current.isLocked;
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

    const disposePlay = reaction(
      () => audioWave.current.shouldPlay,
      (playing) => setIsPlaying(Boolean(playing))
    );

    const disposeMute = reaction(
      () => audioWave.current.isMuted,
      (muted) => setIsMuted(Boolean(muted))
    );

    const disposeLock = reaction(
      () => audioWave.current.isLocked,
      (isLocked) => {
        setIsLocked(Boolean(isLocked));
        setIsMuted(audioWave.current.isMuted);
      }
    );

    return () => {
      disposeWave();
      disposePlay();
      disposeMute();
      disposeLock();
    };
  }, [audioSrc]);

  const onClick = () => {
    audioWave.current.togglePlay();
    setIsMuted(audioWave.current.isMuted);
  };

  const onClickMute = () => {
    audioWave.current.toggleMute();
  };

  return (
    <div
      ref={containerRef}
      onClick={onClick}
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
