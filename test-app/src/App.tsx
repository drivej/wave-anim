import { useEffect, useState } from 'react';
import WaveAnimReact from 'wave-anim';
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      {/* <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}> */}
        <WaveAnimReact
          width={dimensions.width * 0.9}
          height={300}
          audioSrc={audioSrc}
          //style={{
            // position: 'fixed',
            // top: 0,
            // left: 0,
            // zIndex: -1
          //}}
        />

        {/* <div className='Xcontent p-2' style={{padding:5}}>
          <h4>Audio Visualization</h4>
        </div> */}
      {/* </div> */}
    </div>
  );
}

export default App;
