"use client";

import { useViewer } from '@/contexts/ViewerContext';
import { RotateCw, Circle } from 'lucide-react';

export default function ImageControls() {
  const { state, setRotation, setInversion } = useViewer();

  const handleRotate = () => {
    const newRotation = (state.rotation + 90) % 360;
    setRotation(newRotation);
  };

  const handleInvert = () => {
    setInversion(!state.inversion);
  };

  return (
    <div className="absolute bottom-4 right-4 flex gap-2 z-10">
      <button
        onClick={handleRotate}
        className="bg-black/50 hover:bg-black/70 p-3 rounded-md transition-all duration-200"
        title="Rotate image"
        aria-label="Rotate image 90 degrees"
      >
        <RotateCw className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={handleInvert}
        className={`p-3 rounded-md transition-all duration-200 ${
          state.inversion
            ? 'bg-blue-600/70 hover:bg-blue-700/70'
            : 'bg-black/50 hover:bg-black/70'
        }`}
        title="Invert colors"
        aria-label="Invert image colors"
      >
        <Circle className="w-5 h-5 text-white" fill={state.inversion ? 'white' : 'none'} />
      </button>
    </div>
  );
}
