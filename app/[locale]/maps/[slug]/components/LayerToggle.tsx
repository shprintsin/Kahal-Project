'use client';

import React from 'react';

export interface LayerToggleItem {
  slug: string;
  name: string;
  visible: boolean;
}

export interface LayerToggleProps {
  layers: LayerToggleItem[];
  onToggle: (slug: string) => void;
}

export function toggleLayerVisibility(layers: LayerToggleItem[], slug: string): LayerToggleItem[] {
  return layers.map((layer) => layer.slug === slug ? { ...layer, visible: !layer.visible } : layer);
}

export function LayerToggle({ layers, onToggle }: LayerToggleProps) {
  if (layers.length === 0) return null;

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 800,
    background: 'white',
    border: '1px solid #ccc',
    borderRadius: 6,
    padding: '10px 14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    fontSize: 13,
    minWidth: 160,
  };

  return (
    <div className="layer-toggle" style={containerStyle}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Layers</div>
      {layers.map((layer) => (
        <label key={layer.slug} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '3px 0', color: '#333' }}>
          <input
            type="checkbox"
            checked={layer.visible}
            onChange={() => onToggle(layer.slug)}
            style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#3388ff' }}
          />
          <span style={{ opacity: layer.visible ? 1 : 0.5 }}>{layer.name}</span>
        </label>
      ))}
    </div>
  );
}
