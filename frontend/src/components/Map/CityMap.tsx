'use client'
import { useEffect, useRef } from 'react'

interface Marker {
  lat: number
  lng: number
  label?: string
  color?: string
  popup?: string
  radius?: number
}

interface CityMapProps {
  markers?: Marker[]
  height?: string
  center?: [number, number]
  zoom?: number
  recenterToken?: number
  circles?: { lat: number; lng: number; radius: number; color: string; opacity?: number }[]
}

export default function CityMap({
  markers = [],
  height = '400px',
  center = [41.0082, 28.9784],
  zoom = 11,
  recenterToken = 0,
  circles = [],
}: CityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const circlesRef = useRef<any[]>([])
  const invalidateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialCenterRef = useRef(center)
  const initialZoomRef = useRef(zoom)
  const centerRef = useRef(center)
  const zoomRef = useRef(zoom)

  useEffect(() => {
    centerRef.current = center
    zoomRef.current = zoom
  }, [center, zoom])

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return
    if (mapInstanceRef.current) return

    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return

      // Fix default marker icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current, {
        center: initialCenterRef.current,
        zoom: initialZoomRef.current,
        zoomControl: true,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      }).addTo(map)

      mapInstanceRef.current = map

      // Konteyner boyutu render sonrası netleşince tile'ları yenile
      invalidateTimerRef.current = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize()
        }
      }, 150)
    })

    return () => {
      if (invalidateTimerRef.current) {
        clearTimeout(invalidateTimerRef.current)
        invalidateTimerRef.current = null
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Recenter only when caller explicitly requests (e.g., city tab click).
  useEffect(() => {
    if (!mapInstanceRef.current) return
    mapInstanceRef.current.setView(centerRef.current, zoomRef.current, { animate: false })
  }, [recenterToken])

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current) return
    import('leaflet').then((L) => {
      if (!mapInstanceRef.current) return
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      markers.forEach(({ lat, lng, color = '#00d4ff', popup, radius = 8 }) => {
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:${radius * 2}px;height:${radius * 2}px;background:${color};border:2px solid white;border-radius:50%;opacity:0.9;box-shadow:0 0 8px ${color}"></div>`,
          iconSize: [radius * 2, radius * 2],
          iconAnchor: [radius, radius],
        })
        const m = L.marker([lat, lng], { icon })
        if (popup) m.bindPopup(`<div style="background:#0d1627;color:#e2e8f0;padding:8px;border-radius:8px;font-size:12px;min-width:140px;">${popup}</div>`)
        m.addTo(mapInstanceRef.current)
        markersRef.current.push(m)
      })

      circlesRef.current.forEach((c) => c.remove())
      circlesRef.current = []
      circles.forEach(({ lat, lng, radius, color, opacity = 0.25 }) => {
        const c = L.circle([lat, lng], {
          radius,
          color,
          fillColor: color,
          fillOpacity: opacity,
          weight: 1,
        }).addTo(mapInstanceRef.current)
        circlesRef.current.push(c)
      })
    })
  }, [markers, circles])

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden' }}
    />
  )
}
