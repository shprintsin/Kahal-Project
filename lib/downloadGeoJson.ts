export function triggerBrowserDownload(url: string, filename?: string) {
  const link = document.createElement('a')
  link.href = url
  if (filename) link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function downloadGeoJson(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/geo+json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.geojson') ? filename : `${filename}.geojson`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function fetchAndDownloadGeoJson(
  layerId: string,
  layerName: string,
  existingData?: unknown,
  sourceUrl?: string,
) {
  if (existingData) {
    downloadGeoJson(existingData, layerName)
    return
  }

  const apiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || ''
  const fetchUrl = sourceUrl || `${apiUrl}/api/geo/geojson/${layerId}`
  const response = await fetch(fetchUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch GeoJSON: ${response.statusText}`)
  }

  const data = await response.json()
  downloadGeoJson(data, layerName)
}
