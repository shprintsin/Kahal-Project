"use client";

import { Popup } from 'react-map-gl/maplibre';
import type { PopupConfig } from '@/types/map-config';

export interface FeaturePopupData {
  longitude: number;
  latitude: number;
  properties: Record<string, string | number | boolean | null>;
  layerName: string;
  popupConfig?: PopupConfig;
}

interface MapPopupProps {
  data: FeaturePopupData;
  onClose: () => void;
}

function substituteTemplate(
  template: string,
  properties: Record<string, string | number | boolean | null>,
): string {
  return template.replace(/\{(\w+)\}/g, (_match, field: string) => {
    const val = properties[field];
    return val != null ? String(val) : '';
  });
}

export function MapPopup({ data, onClose }: MapPopupProps) {
  const { longitude, latitude, properties, layerName, popupConfig } = data;

  // Determine which fields / template to render
  const isTemplate = popupConfig?.type === 'template' && popupConfig.template;

  let content: React.ReactNode;

  if (isTemplate) {
    const html = substituteTemplate(popupConfig!.template!, properties);
    content = (
      <div
        className="popup-template"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } else {
    // List mode: show selected fields or all properties
    const fieldsToShow =
      popupConfig?.fields && popupConfig.fields.length > 0
        ? popupConfig.fields
        : Object.keys(properties);

    content = (
      <div className="popup-list">
        {fieldsToShow.map((field) => {
          const value = properties[field];
          if (value == null) return null;
          return (
            <div
              key={field}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                padding: '3px 0',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  color: '#555',
                  whiteSpace: 'nowrap',
                  fontSize: 12,
                }}
              >
                {field}
              </span>
              <span
                style={{
                  color: '#222',
                  textAlign: 'end',
                  fontSize: 12,
                }}
              >
                {String(value)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      onClose={onClose}
      closeOnClick={false}
      maxWidth="320px"
      anchor="bottom"
      offset={[0, -8] as [number, number]}
    >
      <div
        dir="auto"
        style={{
          padding: '8px 4px 4px',
          minWidth: 160,
          maxWidth: 300,
        }}
      >
        {/* <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#166534',
            marginBottom: 6,
            borderBottom: '2px solid #d1fae5',
            paddingBottom: 4,
          }}
        >
          {layerName}
        </div> */}
        {content}
      </div>
    </Popup>
  );
}
