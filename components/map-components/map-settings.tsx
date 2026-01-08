"use client";

import React from 'react';
import type { MapConfig } from '../../app/admin/maps/types/config.types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Presets from DefaultConfig (copied here for simplicity if not exported)
const TILE_PRESETS: Record<string, { src: string; maxZoom: number; subdomains?: string; attribution?: string }> = {
  'OpenStreetMap': {
    src: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  },
  'CartoDB Positron': {
    src: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    maxZoom: 20,
    subdomains: 'abcd',
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  },
  'CartoDB Dark Matter': {
    src: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    maxZoom: 20,
    subdomains: 'abcd',
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  },
  'Esri World Imagery': {
    src: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 17,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
};

interface MapSettingsProps {
  config: MapConfig;
  onUpdateTile: (tile: Partial<MapConfig['tile']>) => void;
  onUpdateZoom: (zoom: number) => void;
  onUpdateCenter: (center: [number, number]) => void;
}

export function MapSettings({
  config,
  onUpdateTile,
  onUpdateZoom,
  onUpdateCenter
}: MapSettingsProps) {
  const [customTileUrl, setCustomTileUrl] = React.useState('');

  const handleTilePresetChange = (presetName: string) => {
    if (presetName === 'custom') {
      return;
    }
    const preset = TILE_PRESETS[presetName];
    if (preset) {
      onUpdateTile(preset);
    }
  };

  const handleCustomTileUrl = () => {
    if (customTileUrl) {
      onUpdateTile({ src: customTileUrl });
    }
  };

  const getCurrentPreset = () => {
    for (const [name, preset] of Object.entries(TILE_PRESETS)) {
      if (preset.src === config.tile.src) {
        return name;
      }
    }
    return 'custom';
  };

  return (
    <Card className="rounded-none border-x-0 border-t-0 shadow-none">
      <CardContent className="space-y-6 pt-6">
        {/* Tile Layer Preset */}
        <div className="space-y-2">
          <Label>Base Map</Label>
          <Select 
            value={getCurrentPreset()}
            onValueChange={handleTilePresetChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a basemap" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(TILE_PRESETS).map(name => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
              <SelectItem value="custom">Custom URL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Tile URL */}
        {getCurrentPreset() === 'custom' && (
          <div className="space-y-2">
            <Label>Custom Tile URL</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={customTileUrl || config.tile.src}
                onChange={(e) => setCustomTileUrl(e.target.value)}
                placeholder="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="font-mono text-xs"
              />
              <Button size="sm" onClick={handleCustomTileUrl}>
                Apply
              </Button>
            </div>
          </div>
        )}

        {/* Center Coordinates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Center Latitude</Label>
            <Input
              type="number"
              min={-90}
              max={90}
              step={0.000001}
              value={config.center[0]}
              onChange={(e) => onUpdateCenter([parseFloat(e.target.value), config.center[1]])}
            />
          </div>
          <div className="space-y-2">
            <Label>Center Longitude</Label>
            <Input
              type="number"
              min={-180}
              max={180}
              step={0.000001}
              value={config.center[1]}
              onChange={(e) => onUpdateCenter([config.center[0], parseFloat(e.target.value)])}
            />
          </div>
        </div>

        {/* Max Zoom */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Default Zoom</Label>
            <Input
              type="number"
              min={1}
              max={20}
              step={1}
              value={config.zoom}
              onChange={(e) => onUpdateZoom(parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Max Zoom</Label>
            <Input
              type="number"
              min={1}
              max={20}
              step={1}
              value={config.tile.maxZoom}
              onChange={(e) => onUpdateTile({ maxZoom: parseInt(e.target.value) })}
            />          
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
