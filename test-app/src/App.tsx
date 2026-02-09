import { useEffect, useRef, useState } from 'react';
import WaveAnimReact, { useWaveControls, WaveAnimHandle } from 'wave-anim';
import './App.css';
import audioSrc from './assets/48K_1713045663.m4a';

// const useWaveControls = (waveRef: React.RefObject<WaveAnimHandle>) => {
//   const [isLocked, setIsLocked] = useState(true);
//   const [isMuted, setIsMuted] = useState(true);
//   const [isPlaying, setIsPlaying] = useState(false);

//   useEffect(() => {
//     if (!waveRef.current) return;
//     setIsLocked(waveRef.current.isLocked);
//     setIsMuted(waveRef.current.isMuted);
//     setIsPlaying(waveRef.current.isPlaying);
//     waveRef.current.setMute(false);
//     const unsubscribe = waveRef.current.subscribe((state) => {
//       setIsPlaying(state.isPlaying);
//       setIsMuted(state.isMuted);
//       setIsLocked(state.isLocked);
//     });
//     return unsubscribe;
//   }, [waveRef]);
//   return { isLocked, isMuted, isPlaying, togglePlay: waveRef.current?.togglePlay, toggleMute: waveRef.current?.toggleMute };
// };

function App() {
  const waveRef = useRef<WaveAnimHandle>(null!);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  const { isLocked, isMuted, isPlaying, togglePlay, toggleMute } = useWaveControls(waveRef);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
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
      </div>
    </div>
  );
}

export default App;
