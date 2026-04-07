"use client";

import { useState } from 'react';
import type { PolygonStyleConfig, PointStyleConfig, LegendConfig } from '@/types/map-config';

/* ── Shared glass style ──────────────────────────────────── */
const GLASS: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.88)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: 12,
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
};

/* ── Types ───────────────────────────────────────────────── */
export interface LegendLayerInput {
  name: string;
  slug: string;
  style: PolygonStyleConfig | PointStyleConfig;
  type: 'polygon' | 'point';
}

export interface LegendProps {
  layers: LegendLayerInput[];
  config: LegendConfig;
}

interface LegendSwatch { color: string; label: string; }

interface LegendItem {
  layerName: string;
  layerType: 'polygon' | 'point';
  type: 'simple' | 'category' | 'graduated';
  swatches: LegendSwatch[];
  ramp?: { start: string; end: string; breaks: number[] };
}

/* ── Color interpolation (self-contained) ────────────────── */
function interpolateColor(start: string, end: string, ratio: number): string {
  const parse = (h: string) => {
    const c = h.replace('#', '');
    return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
  };
  const [r1, g1, b1] = parse(start);
  const [r2, g2, b2] = parse(end);
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/* ── Build legend items from layer configs ───────────────── */
export function buildLegendItems(layers: LegendLayerInput[]): LegendItem[] {
  return layers.map((layer) => {
    const { style } = layer;

    if (style.type === 'category') {
      const dict = style.color_dict ?? {};
      const entries = Object.entries(dict);
      if (entries.length === 0) {
        const fallback = 'default_color' in style
          ? (style as PolygonStyleConfig).default_color
          : (style as PointStyleConfig).fillColor;
        return { layerName: layer.name, layerType: layer.type, type: 'category' as const, swatches: [{ color: fallback, label: layer.name }] };
      }
      return { layerName: layer.name, layerType: layer.type, type: 'category' as const, swatches: entries.map(([label, color]) => ({ color, label })) };
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
        else label = `${breaks[i - 1]} - ${breaks[i]}`;
        swatches.push({ color, label });
      }
      return { layerName: layer.name, layerType: layer.type, type: 'graduated' as const, swatches, ramp: { start: colorRamp.start, end: colorRamp.end, breaks } };
    }

    const simpleColor = 'default_color' in style
      ? (style as PolygonStyleConfig).default_color
      : (style as PointStyleConfig).fillColor;
    return { layerName: layer.name, layerType: layer.type, type: 'simple' as const, swatches: [{ color: simpleColor, label: layer.name }] };
  });
}

/* ── Position map ────────────────────────────────────────── */
const POSITION_STYLES: Record<string, React.CSSProperties> = {
  topright:    { top: 16, right: 16 },
  bottomright: { bottom: 16, right: 16 },
  bottomleft:  { bottom: 16, left: 16 },
  topleft:     { top: 16, left: 16 },
};

/* ── Swatch renderer ─────────────────────────────────────── */
function Swatch({ color, label, isPoint }: { color: string; label: string; isPoint: boolean }) {
  const shape: React.CSSProperties = isPoint
    ? { width: 12, height: 12, borderRadius: '50%', backgroundColor: color, border: '2px solid rgba(255,255,255,0.9)', boxShadow: `0 0 0 1px ${color}` }
    : { width: 16, height: 12, borderRadius: 3, backgroundColor: color, border: '1px solid rgba(0,0,0,0.1)' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
      <span style={{ ...shape, flexShrink: 0, display: 'inline-block' }} />
      <span style={{ color: '#374151', fontSize: 12, lineHeight: 1.3 }}>{label}</span>
    </div>
  );
}

/* ── Component ───────────────────────────────────────────── */
export function Legend({ layers, config }: LegendProps) {
  const [collapsed, setCollapsed] = useState(config.collapsed ?? false);
  const items = buildLegendItems(layers);

  if (items.length === 0) return null;

  const position = config.position ?? 'bottomright';
  const posStyle = POSITION_STYLES[position] ?? POSITION_STYLES.bottomright;

  return (
    <div
      className="map-legend"
      style={{
        ...GLASS,
        position: 'absolute',
        ...posStyle,
        zIndex: 800,
        padding: '12px 16px',
        fontSize: 13,
        minWidth: collapsed ? 'auto' : 160,
        maxHeight: '60vh',
        overflowY: 'auto',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        {!collapsed && (
          <span style={{ fontWeight: 600, fontSize: 13, color: '#111827', letterSpacing: 0.2 }}>Legend</span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand legend' : 'Collapse legend'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
            fontSize: 14, color: '#6B7280', lineHeight: 1, borderRadius: 4,
          }}
        >
          {collapsed ? '\u2630' : '\u2212'}
        </button>
      </div>

      {/* Body with smooth collapse */}
      <div style={{
        maxHeight: collapsed ? 0 : 600,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
        marginTop: collapsed ? 0 : 8,
      }}>
        {items.map((item) => (
          <div key={item.layerName} style={{ marginBottom: 10 }}>
            {items.length > 1 && (
              <div style={{ fontWeight: 600, fontSize: 12, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {item.layerName}
              </div>
            )}

            {/* Gradient bar for graduated */}
            {item.type === 'graduated' && item.ramp && (
              <div style={{ marginBottom: 6 }}>
                <div style={{
                  height: 10, borderRadius: 5,
                  background: `linear-gradient(to right, ${item.ramp.start}, ${item.ramp.end})`,
                  border: '1px solid rgba(0,0,0,0.06)',
                }} />
                {item.ramp.breaks.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9CA3AF', marginTop: 3, padding: '0 2px' }}>
                    {item.ramp.breaks.map((b) => <span key={b}>{b}</span>)}
                  </div>
                )}
              </div>
            )}

            {/* Swatches */}
            {item.swatches.map((sw) => (
              <Swatch key={sw.label} color={sw.color} label={sw.label} isPoint={item.layerType === 'point'} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
