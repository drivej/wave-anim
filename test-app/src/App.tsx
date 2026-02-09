import { useEffect, useRef, useState } from 'react';
import WaveAnimReact from 'wave-anim';
import { WaveAnimHandle } from '../../dist/WaveAnimReact';
import './App.css';
import audioSrc from './assets/48K_1713045663.m4a';

function App() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const waveRef = useRef<WaveAnimHandle>(null!);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <WaveAnimReact ref={waveRef} width={dimensions.width * 0.9} height={300} audioSrc={audioSrc} />

      {waveRef.current ? (
        <div className='flex gap-2 p-2'>
          {waveRef.current.isLocked ? (
            <span className='px-6 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 active:scale-95'>Click anywhere to unlock audio player</span>
          ) : (
            <>
              <button onClick={waveRef.current.togglePlay} className='px-6 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 active:scale-95'>
                {waveRef.current.isPlaying ? 'Pause' : 'Play'}
              </button>
              <button onClick={waveRef.current.toggleMute} className='px-6 py-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 active:scale-95'>
                {waveRef.current.isMuted ? 'Unmute' : 'Mute'}
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default App;
