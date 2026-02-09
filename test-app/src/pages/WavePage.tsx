import { useEffect, useRef, useState } from 'react';
import WaveAnimReact, { useWaveControls, WaveAnimHandle } from 'wave-anim';
import audioSrc from '../assets/48K_1713045663.m4a';

function WavePage() {
  const waveRef = useRef<WaveAnimHandle>(null!);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const { isLocked, isMuted, isPlaying, togglePlay, toggleMute, destroy } = useWaveControls(waveRef);

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

  useEffect(() => {
    return () => {
      console.log('WavePage unmounting, calling destroy');
      destroy?.();
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '2rem', color: '#fff' }}>Wave Player Page</h1>

      <WaveAnimReact ref={waveRef} width={dimensions.width * 0.9} height={300} audioSrc={audioSrc} onClick={() => waveRef.current.togglePlay()} />

      <div className='flex gap-2 p-2'>
        {isLocked ? (
          <span className='px-6 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 active:scale-95'>Click anywhere to unlock audio player</span>
        ) : (
          <>
            <button onClick={togglePlay} className='px-6 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 active:scale-95'>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={toggleMute} className='px-6 py-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 active:scale-95'>
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </>
        )}
                    {/* <button onClick={play} className='px-6 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 active:scale-95'>
              Play
            </button> */}
      </div>

      <pre>{JSON.stringify({ isLocked, isMuted, isPlaying }, null, 2)}</pre>
    </div>
  );
}

export default WavePage;
