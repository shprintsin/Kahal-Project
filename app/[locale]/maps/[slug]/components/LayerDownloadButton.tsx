"use client"

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fetchAndDownloadGeoJson } from '@/lib/downloadGeoJson'
import type { MapLayer } from '@/types/api-types'

interface LayerDownloadButtonProps {
  layer: MapLayer
  className?: string
}

export function LayerDownloadButton({ layer, className }: LayerDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await fetchAndDownloadGeoJson(
        layer.id,
        layer.filename || layer.slug,
        layer.geoJsonData,
        layer.sourceUrl,
      )
    } catch (err) {
      console.error(`Failed to download layer "${layer.name}":`, err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleDownload}
      disabled={downloading}
      className={className}
      title={`הורד ${layer.name} כ-GeoJSON`}
    >
      {downloading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
    </Button>
  )
}
