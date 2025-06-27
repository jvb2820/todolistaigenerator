
import React from 'react';

const PaperPin: React.FC<{ position: 'left' | 'right' }> = ({ position }) => (
  <div 
    className={`absolute top-2 ${position === 'left' ? 'left-2' : 'right-2'} w-5 h-5 rounded-full shadow-md z-10`}
    style={{
      background: 'radial-gradient(circle at 30% 30%, #FFF352, #FFD000)', // Yellowish gradient
      boxShadow: '0 1px 2px rgba(0,0,0,0.2), inset 0 0 1px rgba(255,255,255,0.5)'
    }}
    aria-hidden="true"
  />
);

interface PaperPinsProps {
    showPins?: boolean;
}

const PaperPins: React.FC<PaperPinsProps> = ({ showPins = true }) => {
  if (!showPins) {
    return null;
  }
  return (
    <>
      <PaperPin position="left" />
      <PaperPin position="right" />
    </>
  );
};

export default PaperPins;
