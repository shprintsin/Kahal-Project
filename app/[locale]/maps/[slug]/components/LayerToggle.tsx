"use client";

import { useState } from 'react';
import { Layers } from 'lucide-react';

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
export interface LayerToggleItem {
  slug: string;
  name: string;
  visible: boolean;
  color?: string;
}

export interface LayerToggleProps {
  items: LayerToggleItem[];
  onToggle: (slug: string) => void;
}

/* ── Utility (re-exported for parent state management) ──── */
export function toggleLayerVisibility(items: LayerToggleItem[], slug: string): LayerToggleItem[] {
  return items.map((item) => item.slug === slug ? { ...item, visible: !item.visible } : item);
}

/* ── Toggle switch sub-component ─────────────────────────── */
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  const trackStyle: React.CSSProperties = {
    position: 'relative',
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: checked ? '#3B82F6' : '#D1D5DB',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    flexShrink: 0,
  };

  const thumbStyle: React.CSSProperties = {
    position: 'absolute',
    top: 2,
    left: checked ? 18 : 2,
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    transition: 'left 0.2s ease',
  };

  return (
    <div
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onClick={onChange}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(); } }}
      style={trackStyle}
    >
      <div style={thumbStyle} />
    </div>
  );
}

/* ── Component ───────────────────────────────────────────── */
export function LayerToggle({ items, onToggle }: LayerToggleProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (items.length === 0) return null;

  return (
    <div
      className="layer-toggle"
      style={{
        ...GLASS,
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 800,
        padding: '12px 16px',
        fontSize: 13,
        minWidth: collapsed ? 'auto' : 180,
        transition: 'all 0.25s ease',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        aria-label={collapsed ? 'Show layers' : 'Hide layers'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          width: '100%',
          color: '#111827',
          fontWeight: 600,
          fontSize: 13,
          letterSpacing: 0.2,
        }}
      >
        <Layers size={16} strokeWidth={2} color="#6B7280" />
        {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>Layers</span>}
        <span style={{
          fontSize: 10, color: '#9CA3AF',
          transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
        }}>
          {'\u25BC'}
        </span>
      </button>

      {/* Body with smooth collapse */}
      <div style={{
        maxHeight: collapsed ? 0 : 400,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
      }}>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item) => (
            <div
              key={item.slug}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '4px 0',
                opacity: item.visible ? 1 : 0.55,
                transition: 'opacity 0.2s ease',
              }}
            >
              <ToggleSwitch checked={item.visible} onChange={() => onToggle(item.slug)} />
              {item.color && (
                <span style={{
                  width: 10, height: 10, borderRadius: '50%',
                  backgroundColor: item.color,
                  border: '1px solid rgba(0,0,0,0.1)',
                  flexShrink: 0,
                }} />
              )}
              <span style={{ color: '#374151', fontSize: 13, lineHeight: 1.3 }}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
