import { reaction } from 'mobx';
import React, { useEffect, useRef, useState } from 'react';
import { AudioWave } from './audio-wave/AudioWave.js';
import WaveCanvas from './wave-builder/WaveCanvas.js';

export interface WaveAnimReactProps {
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  audioSrc?: string;
}

export const WaveAnimReact: React.FC<WaveAnimReactProps> = ({ width, height, className, style, audioSrc }) => {
  const audioWave = useRef(new AudioWave());
  const waveCanvas = useRef(new WaveCanvas());
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLocked, setIsLocked] = useState(true);

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
    console.log('isMuted', audioWave.current.isMuted);
    setIsMuted(audioWave.current.isMuted);
  };

  const onClickMute = () => {
    audioWave.current.toggleMute();
  };

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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
      <div className='flex gap-2 p-2'>
        {isLocked ? (
          <span className='px-6 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 active:scale-95'>Click anywhere to unlock audio player</span>
        ) : (
          <>
            <button onClick={onClick} className='px-6 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 active:scale-95'>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={onClickMute} className='px-6 py-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 active:scale-95'>
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
