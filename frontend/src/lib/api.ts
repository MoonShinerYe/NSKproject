const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    signal: init?.signal ?? AbortSignal.timeout(4000),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

export interface CheckinResult {
  ok: boolean
  distance: number
  radius: number
  message: string
}

export const api = {
  health: () => request<{ status: string; places: number }>('/api/health'),

  checkin: (payload: { placeId: string; lat: number; lng: number; deviceId: string }) =>
    request<CheckinResult>('/api/checkins', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  addReview: (
    placeId: string,
    payload: { author: string; rating: number; text: string },
  ) =>
    request<{ id: string }>(`/api/places/${placeId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}

export function newDeviceId(): string {
  const key = 'vokrug-nsk:device'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `dev-${Date.now()}-${Math.random().toString(16).slice(2)}`
    localStorage.setItem(key, id)
  }
  return id
}
