export interface Coords {
  lat: number
  lng: number
}

const EARTH_RADIUS_M = 6_371_000

/** Расстояние между двумя точками по формуле гаверсинуса, в метрах. */
export function distanceMeters(a: Coords, b: Coords): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)))
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters)) return '—'
  if (meters < 1000) return `${Math.round(meters / 10) * 10} м`
  return `${(meters / 1000).toFixed(meters < 10_000 ? 1 : 0).replace('.', ',')} км`
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} мин`
  const h = Math.floor(min / 60)
  const rest = min % 60
  return rest ? `${h} ч ${rest} мин` : `${h} ч`
}

/** Пешее время: ~4,5 км/ч + запас на остановки. */
export function walkMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / 75))
}

export interface GeoError {
  code: 'unsupported' | 'denied' | 'unavailable' | 'timeout'
  message: string
}

export function getPosition(options?: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject({ code: 'unsupported', message: 'Браузер не поддерживает геолокацию' } satisfies GeoError)
      return
    }
    navigator.geolocation.getCurrentPosition(
      resolve,
      (err) => {
        const code: GeoError['code'] =
          err.code === err.PERMISSION_DENIED
            ? 'denied'
            : err.code === err.TIMEOUT
              ? 'timeout'
              : 'unavailable'
        const message =
          code === 'denied'
            ? 'Доступ к геолокации запрещён. Разрешите его в настройках браузера.'
            : code === 'timeout'
              ? 'Не удалось определить местоположение: истекло время ожидания.'
              : 'Не удалось определить местоположение.'
        reject({ code, message } satisfies GeoError)
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000, ...options },
    )
  })
}

export function isGeoSupported(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator
}
