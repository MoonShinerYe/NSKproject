import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Place } from '../types'
import { categoryMeta } from '../lib/filters'

interface MapViewProps {
  places: Place[]
  activeId?: string
  route?: Place[]
  userPosition?: { lat: number; lng: number } | null
  className?: string
  zoom?: number
  center?: [number, number]
  interactive?: boolean
}

const NSK_CENTER: [number, number] = [55.0287, 82.921]

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function MapView({
  places,
  activeId,
  route,
  userPosition,
  className,
  zoom = 12,
  center = NSK_CENTER,
  interactive = true,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: interactive,
      scrollWheelZoom: false,
      dragging: interactive,
      touchZoom: interactive,
      doubleClickZoom: interactive,
      boxZoom: false,
      keyboard: interactive,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map)

    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    const resize = () => map.invalidateSize()
    window.addEventListener('resize', resize)
    const timer = window.setTimeout(resize, 200)

    return () => {
      window.removeEventListener('resize', resize)
      window.clearTimeout(timer)
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [center, zoom, interactive])

  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return

    layer.clearLayers()

    const markers: L.Marker[] = places.map((place) => {
      const cat = categoryMeta[place.category]
      const isActive = place.id === activeId
      const marker = L.marker([place.lat, place.lng], {
        icon: L.divIcon({
          className: '',
          html: `<div class="map-pin ${isActive ? 'map-pin--active' : ''}"><span>${cat.emoji}</span></div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 28],
          popupAnchor: [0, -26],
        }),
        title: place.name,
        keyboard: true,
      })
      marker.bindPopup(
        `<b>${escapeHtml(place.shortName || place.name)}</b><br/>${escapeHtml(place.address)}<br/>
         <a href="/mesta/${encodeURIComponent(place.id)}">Открыть карточку →</a>`,
        { closeButton: false },
      )
      marker.addTo(layer)
      return marker
    })

    if (route && route.length > 1) {
      L.polyline(
        route.map((p) => [p.lat, p.lng] as [number, number]),
        { color: '#930400', weight: 3, dashArray: '8 7', opacity: 0.8 },
      ).addTo(layer)
    }

    if (userPosition) {
      L.circleMarker([userPosition.lat, userPosition.lng], {
        radius: 7,
        color: '#fffdf8',
        weight: 3,
        fillColor: '#3d6ea8',
        fillOpacity: 1,
      })
        .bindTooltip('Вы здесь', { direction: 'top' })
        .addTo(layer)
    }

    if (places.length === 1) {
      map.setView([places[0].lat, places[0].lng], 15, { animate: false })
    } else if (places.length > 1) {
      const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng] as [number, number]))
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14, animate: false })
    }

    if (activeId) {
      const target = places.find((p) => p.id === activeId)
      const marker = markers.find(
        (m) => target && m.getLatLng().lat === target.lat && m.getLatLng().lng === target.lng,
      )
      if (marker) {
        map.setView(marker.getLatLng(), 15, { animate: true })
        marker.openPopup()
      }
    }
  }, [places, activeId, route, userPosition])

  return <div ref={containerRef} className={className ?? 'map-card'} role="application" aria-label="Карта мест" />
}
