"use client";

import { useDataStudio } from "../store";

export function StatusBar() {
  const { state } = useDataStudio();

  const totalFeatures = state.layers.reduce((sum, l) => sum + l.featureCount, 0);
  const visibleLayers = state.layers.filter((l) => l.visible).length;

  return (
    <div className="h-7 border-t border-border bg-card flex items-center px-3 gap-4 text-[10px] text-muted-foreground flex-shrink-0 font-mono">
      <span>
        {state.center[0].toFixed(4)}, {state.center[1].toFixed(4)}
      </span>
      <span>Zoom: {state.zoom.toFixed(1)}</span>
      <div className="flex-1" />
      <span>
        {visibleLayers}/{state.layers.length} layers
      </span>
      <span>{totalFeatures.toLocaleString()} features</span>
      {state.isDirty && (
        <span className="text-amber-500 font-sans font-medium">Unsaved changes</span>
      )}
    </div>
  );
}
