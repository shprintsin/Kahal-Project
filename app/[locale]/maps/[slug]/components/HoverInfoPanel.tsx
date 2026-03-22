'use client';

import React from 'react';

export interface HoverInfoPanelProps {
  mode: 'floating' | 'sidebar';
  feature: Record<string, unknown> | null;
  fields?: string[];
  template?: string;
  position?: { x: number; y: number };
}

function substituteTemplate(template: string, properties: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (_match, field) => {
    const val = properties[field];
    return val != null ? String(val) : '';
  });
}

export function HoverInfoPanel({ mode, feature, fields, template, position }: HoverInfoPanelProps) {
  if (!feature) return null;

  let content: React.ReactNode;
  if (template) {
    const html = substituteTemplate(template, feature);
    content = <div dangerouslySetInnerHTML={{ __html: html }} />;
  } else {
    const keys = fields && fields.length > 0 ? fields : Object.keys(feature);
    content = (
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <tbody>
          {keys.map((key) => (
            <tr key={key}>
              <td style={{ padding: '2px 8px 2px 0', fontWeight: 600, color: '#555', whiteSpace: 'nowrap' }}>{key}</td>
              <td style={{ padding: '2px 0', color: '#333' }}>{feature[key] != null ? String(feature[key]) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (mode === 'floating') {
    return (
      <div style={{
        position: 'absolute',
        left: position ? position.x + 12 : 0,
        top: position ? position.y + 12 : 0,
        zIndex: 1000,
        pointerEvents: 'none',
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: 4,
        padding: '8px 12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        maxWidth: 320,
        fontSize: 13,
      }}>
        {content}
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: 280,
      height: '100%',
      zIndex: 1000,
      background: 'white',
      borderLeft: '1px solid #ccc',
      padding: 16,
      overflowY: 'auto',
      fontSize: 13,
    }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>Feature Info</h4>
      {content}
    </div>
  );
}
