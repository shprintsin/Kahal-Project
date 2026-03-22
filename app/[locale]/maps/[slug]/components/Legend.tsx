'use client';

import React, { useState } from 'react';
import { interpolateColor } from '@/lib/mapUtils';
import type { PolygonStyleConfig, PointStyleConfig, LegendConfig } from '@/types/map-config';

export interface LegendLayerInput {
  name: string;
  style: PolygonStyleConfig | PointStyleConfig;
}

export interface LegendProps {
  layers: LegendLayerInput[];
  config: LegendConfig;
}

interface LegendSwatch {
  color: string;
  label: string;
}

interface LegendItem {
  layerName: string;
  type: 'simple' | 'category' | 'graduated';
  swatches: LegendSwatch[];
  ramp?: { start: string; end: string; breaks: number[] };
}

function buildLegendItems(layers: LegendLayerInput[]): LegendItem[] {
  return layers.map((layer) => {
    const { style } = layer;

    if (style.type === 'category') {
      const dict = style.color_dict ?? {};
      const entries = Object.entries(dict);
      if (entries.length === 0) {
        const fallbackColor = 'default_color' in style
          ? (style as PolygonStyleConfig).default_color
          : (style as PointStyleConfig).fillColor;
        return { layerName: layer.name, type: 'category' as const, swatches: [{ color: fallbackColor, label: layer.name }] };
      }
      return { layerName: layer.name, type: 'category' as const, swatches: entries.map(([label, color]) => ({ color, label })) };
    }

    if (style.type === 'graduated' && style.graduated) {
      const { colorRamp, breaks } = style.graduated;
      const totalBins = breaks.length + 1;
      const swatches: LegendSwatch[] = [];
      for (let i = 0; i < totalBins; i++) {
        const ratio = totalBins === 1 ? 0 : i / (totalBins - 1);
        const color = interpolateColor(colorRamp.start, colorRamp.end, ratio);
        let label: string;
        if (i === 0) label = breaks.length > 0 ? `< ${breaks[0]}` : layer.name;
        else if (i === breaks.length) label = `>= ${breaks[breaks.length - 1]}`;
        else label = `${breaks[i - 1]} – ${breaks[i]}`;
        swatches.push({ color, label });
      }
      return { layerName: layer.name, type: 'graduated' as const, swatches, ramp: { start: colorRamp.start, end: colorRamp.end, breaks } };
    }

    const simpleColor = 'default_color' in style
      ? (style as PolygonStyleConfig).default_color
      : (style as PointStyleConfig).fillColor;
    return { layerName: layer.name, type: 'simple' as const, swatches: [{ color: simpleColor, label: layer.name }] };
  });
}

const POSITION_STYLES: Record<string, React.CSSProperties> = {
  topright: { top: 12, right: 12 },
  bottomright: { bottom: 12, right: 12 },
  bottomleft: { bottom: 12, left: 12 },
  topleft: { top: 12, left: 12 },
};

export function Legend({ layers, config }: LegendProps) {
  const [collapsed, setCollapsed] = useState(config.collapsed ?? false);
  const items = buildLegendItems(layers);

  if (items.length === 0) return null;

  const position = config.position ?? 'bottomright';
  const posStyle = POSITION_STYLES[position] ?? POSITION_STYLES.bottomright;

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    ...posStyle,
    zIndex: 800,
    background: 'white',
    border: '1px solid #ccc',
    borderRadius: 6,
    padding: collapsed ? '6px 10px' : '10px 14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    fontSize: 12,
    maxHeight: '60vh',
    overflowY: 'auto',
    minWidth: collapsed ? 'auto' : 140,
  };

  return (
    <div className="map-legend" style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {!collapsed && <span style={{ fontWeight: 600, fontSize: 13, marginRight: 8 }}>Legend</span>}
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: '2px 4px', color: '#555' }}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand legend' : 'Collapse legend'}
        >
          {collapsed ? '☰' : '−'}
        </button>
      </div>

      {!collapsed && (
        <div style={{ marginTop: 6 }}>
          {items.map((item) => (
            <div key={item.layerName} style={{ marginBottom: 8 }}>
              {items.length > 1 && <div style={{ fontWeight: 600, marginBottom: 3 }}>{item.layerName}</div>}

              {item.type === 'graduated' && item.ramp && (
                <div style={{ marginBottom: 4 }}>
                  <div style={{ height: 10, borderRadius: 3, background: `linear-gradient(to right, ${item.ramp.start}, ${item.ramp.end})` }} />
                  {item.ramp.breaks.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#666', marginTop: 2 }}>
                      {item.ramp.breaks.map((b) => <span key={b}>{b}</span>)}
                    </div>
                  )}
                </div>
              )}

              {item.swatches.map((sw) => (
                <div key={sw.label} style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 3, backgroundColor: sw.color, border: '1px solid #ccc', marginRight: 6, flexShrink: 0 }} />
                  <span style={{ color: '#333' }}>{sw.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
