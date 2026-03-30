"use client";

import { useDataStudio, BASEMAPS } from "../store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  FileText,
  Layers,
  Loader2,
  Map,
  PanelLeft,
  PanelRight,
  Save,
} from "lucide-react";

interface MapToolbarProps {
  onSave: () => void;
  onBack: () => void;
}

export function MapToolbar({ onSave, onBack }: MapToolbarProps) {
  const { state, dispatch } = useDataStudio();

  return (
    <div className="h-12 border-b border-border bg-card flex items-center gap-2 px-3 flex-shrink-0">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4" />
      </Button>

      <div className="h-5 w-px bg-border" />

      <Map className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <Input
        value={state.title}
        onChange={(e) => dispatch({ type: "SET_TITLE", title: e.target.value })}
        placeholder="Map title..."
        className="h-8 w-64 text-sm font-medium border-none bg-transparent shadow-none focus-visible:ring-1"
      />

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => dispatch({ type: "TOGGLE_LEFT_PANEL" })}
        title="Toggle layer panel"
      >
        {state.leftPanelOpen ? (
          <PanelLeft className="w-4 h-4" />
        ) : (
          <Layers className="w-4 h-4" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => dispatch({ type: "TOGGLE_RIGHT_PANEL" })}
        title="Toggle style panel"
      >
        <PanelRight className="w-4 h-4" />
      </Button>

      <div className="h-5 w-px bg-border" />

      <Select
        value={state.basemap}
        onValueChange={(v) => dispatch({ type: "SET_BASEMAP", basemap: v })}
      >
        <SelectTrigger className="h-8 w-[140px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(BASEMAPS).map(([key, bm]) => (
            <SelectItem key={key} value={key} className="text-xs">
              {bm.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={state.status}
        onValueChange={(v) => dispatch({ type: "SET_STATUS", status: v })}
      >
        <SelectTrigger className="h-8 w-[100px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft" className="text-xs">Draft</SelectItem>
          <SelectItem value="published" className="text-xs">Published</SelectItem>
          <SelectItem value="archived" className="text-xs">Archived</SelectItem>
        </SelectContent>
      </Select>

      <div className="h-5 w-px bg-border" />

      <Button
        variant={state.rightPanelMode === "details" ? "secondary" : "outline"}
        size="sm"
        className="h-8 gap-1.5"
        onClick={() =>
          dispatch({
            type: "SET_RIGHT_PANEL_MODE",
            mode: state.rightPanelMode === "details" ? "style" : "details",
          })
        }
      >
        <FileText className="w-3.5 h-3.5" />
        Details
      </Button>

      <Button
        size="sm"
        onClick={onSave}
        disabled={state.saving || !state.isDirty}
        className="h-8 gap-1.5"
      >
        {state.saving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Save className="w-3.5 h-3.5" />
        )}
        Save
      </Button>
    </div>
  );
}
