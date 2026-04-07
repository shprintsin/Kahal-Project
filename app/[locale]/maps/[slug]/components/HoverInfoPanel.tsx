"use client";

import { useRef, useEffect } from 'react';

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
export interface HoverData {
  properties: Record<string, string | number | boolean | null>;
  position: { x: number; y: number };
  layerName: string;
}

export interface HoverInfoPanelProps {
  data: HoverData | null;
  mode: 'floating' | 'sidebar';
  fields?: string[];
  template?: string;
}

/* ── Template substitution ───────────────────────────────── */
function substituteTemplate(template: string, properties: Record<string, string | number | boolean | null>): string {
  return template.replace(/\{(\w+)\}/g, (_match, field: string) => {
    const val = properties[field];
    return val != null ? String(val) : '';
  });
}

/* ── Formatted key label ─────────────────────────────────── */
function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/* ── Content renderer ────────────────────────────────────── */
function InfoContent({ properties, fields, template }: {
  properties: Record<string, string | number | boolean | null>;
  fields?: string[];
  template?: string;
}) {
  if (template) {
    const html = substituteTemplate(template, properties);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  const keys = fields && fields.length > 0 ? fields : Object.keys(properties);
  const visibleKeys = keys.filter(k => properties[k] != null && properties[k] !== '');

  if (visibleKeys.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {visibleKeys.map((key) => (
        <div key={key} style={{ display: 'flex', gap: 8, fontSize: 12, lineHeight: 1.4 }}>
          <span style={{ color: '#6B7280', fontWeight: 500, whiteSpace: 'nowrap', minWidth: 60 }}>
            {formatKey(key)}
          </span>
          <span style={{ color: '#111827' }}>
            {String(properties[key])}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Floating tooltip ────────────────────────────────────── */
function FloatingPanel({ data, fields, template }: { data: HoverData; fields?: string[]; template?: string }) {
  return (
    <div style={{
      ...GLASS,
      position: 'absolute',
      left: data.position.x + 16,
      top: data.position.y + 16,
      zIndex: 1000,
      pointerEvents: 'none',
      padding: '10px 14px',
      maxWidth: 320,
      fontSize: 13,
    }}>
      <div style={{ fontWeight: 600, fontSize: 12, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {data.layerName}
      </div>
      <InfoContent properties={data.properties} fields={fields} template={template} />
    </div>
  );
}

/* ── Sidebar panel with slide-in ─────────────────────────── */
function SidebarPanel({ data, fields, template }: { data: HoverData | null; fields?: string[]; template?: string }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isVisible = data !== null;

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.style.transform = isVisible ? 'translateX(0)' : 'translateX(100%)';
    }
  }, [isVisible]);

  /* Detect RTL */
  const dir = typeof document !== 'undefined' ? document.documentElement.dir : 'ltr';
  const isRTL = dir === 'rtl';

  const sideStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    [isRTL ? 'left' : 'right']: 0,
    width: 280,
    height: '100%',
    zIndex: 1000,
    ...GLASS,
    borderRadius: 0,
    [isRTL ? 'borderRight' : 'borderLeft']: '1px solid rgba(0,0,0,0.06)',
    padding: 20,
    overflowY: 'auto',
    fontSize: 13,
    transform: isVisible ? 'translateX(0)' : (isRTL ? 'translateX(-100%)' : 'translateX(100%)'),
    transition: 'transform 0.25s ease',
    direction: isRTL ? 'rtl' : 'ltr',
  };

  return (
    <div ref={panelRef} style={sideStyle}>
      {data && (
        <>
          <div style={{
            fontWeight: 600,
            fontSize: 14,
            color: '#111827',
            marginBottom: 12,
            paddingBottom: 8,
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}>
            {data.layerName}
          </div>
          <InfoContent properties={data.properties} fields={fields} template={template} />
        </>
      )}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */
export function HoverInfoPanel({ data, mode, fields, template }: HoverInfoPanelProps) {
  if (mode === 'floating') {
    if (!data) return null;
    return <FloatingPanel data={data} fields={fields} template={template} />;
  }

  return <SidebarPanel data={data} fields={fields} template={template} />;
}
