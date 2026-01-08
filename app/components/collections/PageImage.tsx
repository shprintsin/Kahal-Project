"use client";

import { useState, useEffect, useRef, useMemo } from 'react';

interface PageImageProps {
  imageUrl: string;
  pageLabel: string;
  zoom: number;
  rotation?: number;
  inverted?: boolean;
  containerWidth?: number;
}

/**
 * PageImage with Fit to Width and image manipulation support
 */
export default function PageImage({ 
  imageUrl,
  pageLabel,
  zoom, 
  rotation = 0,
  inverted = false,
  containerWidth 
}: PageImageProps) {
  const [naturalWidth, setNaturalWidth] = useState<number>(0);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Calculate scale factor
  const scaleFactor = useMemo(() => {
    if (zoom === -1 && containerWidth && naturalWidth) {
      // Fit to width mode
      return containerWidth / naturalWidth;
    }
    // Normal zoom mode: convert percentage to decimal
    return zoom / 100;
  }, [zoom, containerWidth, naturalWidth]);

  // Load image to get natural dimensions
  useEffect(() => {
    if (!imgRef.current) return;
    
    const img = imgRef.current;
    
    const handleLoad = () => {
      setNaturalWidth(img.naturalWidth);
    };
    
    if (img.complete && img.naturalWidth) {
      setNaturalWidth(img.naturalWidth);
    } else {
      img.addEventListener('load', handleLoad);
      return () => img.removeEventListener('load', handleLoad);
    }
  }, [imageUrl]);

  // Fit image to container
  const imageStyle: React.CSSProperties = {
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
  };

  // Build transform string (only for rotation now)
  const transform = rotation ? `rotate(${rotation}deg)` : 'none';

  // Build filter string for inversion
  const filter = inverted ? 'invert(1)' : 'none';

  return (
    <div 
      className="w-full h-full flex items-center justify-center"
      style={{ 
        transform,
        transformOrigin: 'center center',
        filter,
        transition: 'filter 0.2s ease'
      }}
    >
      <img
        ref={imgRef}
        src={imageUrl}
        alt={pageLabel}
        style={imageStyle}
        className="select-none"
      />
    </div>
  );
}
