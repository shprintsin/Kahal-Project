"use client"

import { useState, type ReactNode } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { fetchAndDownloadGeoJson } from '@/lib/downloadGeoJson'
import { useDownloadTerms } from '@/components/ui/download-terms-provider'
import type { MapLayer } from '@/lib/view-types'

interface LayerDownloadButtonProps {
  layer: MapLayer
  className?: string
  children?: ReactNode
}

export function LayerDownloadButton({ layer, className, children }: LayerDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false)
  const { requestDownload } = useDownloadTerms()

  const handleClick = () => {
    requestDownload(async () => {
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
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={downloading}
      className={className}
      title={`הורד ${layer.name} כ-GeoJSON`}
    >
      {children}
      {downloading ? (
        <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
      ) : (
        <Download className="h-4 w-4 text-brand-primary" />
      )}
    </button>
  )
}
