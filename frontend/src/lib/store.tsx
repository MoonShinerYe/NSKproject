import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Checkin, Review } from '../types'
import { STORAGE_KEY } from '../config'

type BackendStatus = 'unknown' | 'online' | 'offline'
type ToastTone = 'default' | 'success' | 'error'

interface Toast {
  id: number
  message: string
  tone: ToastTone
}

interface Persisted {
  favorites: string[]
  checkins: Checkin[]
  reviews: Record<string, Review[]>
  name: string
  demoGeo: boolean
}

interface StoreValue extends Persisted {
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => boolean
  checkinFor: (id: string) => Checkin | undefined
  addCheckin: (checkin: Checkin) => void
  addReview: (placeId: string, review: Omit<Review, 'id'>) => void
  setName: (name: string) => void
  setDemoGeo: (value: boolean) => void
  reset: () => void
  toast: Toast | null
  notify: (message: string, tone?: ToastTone) => void
  backend: BackendStatus
  setBackend: (status: BackendStatus) => void
}

const StoreContext = createContext<StoreValue | null>(null)

const EMPTY: Persisted = {
  favorites: [],
  checkins: [],
  reviews: {},
  name: '',
  demoGeo: false,
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<Persisted>
    return {
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      checkins: Array.isArray(parsed.checkins) ? parsed.checkins : [],
      reviews: parsed.reviews && typeof parsed.reviews === 'object' ? parsed.reviews : {},
      name: typeof parsed.name === 'string' ? parsed.name : '',
      demoGeo: Boolean(parsed.demoGeo),
    }
  } catch {
    return EMPTY
  }
}

function uid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(load)
  const [toast, setToast] = useState<Toast | null>(null)
  const [backend, setBackend] = useState<BackendStatus>('unknown')
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* приватный режим — просто не сохраняем */
    }
  }, [state])

  const notify = useCallback((message: string, tone: ToastTone = 'default') => {
    setToast({ id: Date.now(), message, tone })
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    },
    [],
  )

  const isFavorite = useCallback(
    (id: string) => state.favorites.includes(id),
    [state.favorites],
  )

  const toggleFavorite = useCallback(
    (id: string) => {
      const wasFavorite = state.favorites.includes(id)
      setState((prev) => ({
        ...prev,
        favorites: wasFavorite
          ? prev.favorites.filter((f) => f !== id)
          : [id, ...prev.favorites],
      }))
      return !wasFavorite
    },
    [state.favorites],
  )

  const checkinFor = useCallback(
    (id: string) => state.checkins.find((c) => c.placeId === id),
    [state.checkins],
  )

  const addCheckin = useCallback((checkin: Checkin) => {
    setState((prev) => ({
      ...prev,
      checkins: [checkin, ...prev.checkins.filter((c) => c.placeId !== checkin.placeId)],
    }))
  }, [])

  const addReview = useCallback((placeId: string, review: Omit<Review, 'id'>) => {
    const full: Review = { ...review, id: uid() }
    setState((prev) => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        [placeId]: [full, ...(prev.reviews[placeId] ?? [])],
      },
    }))
  }, [])

  const setName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, name }))
  }, [])

  const setDemoGeo = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, demoGeo: value }))
  }, [])

  const reset = useCallback(() => {
    setState(EMPTY)
    notify('Данные профиля очищены', 'default')
  }, [notify])

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      isFavorite,
      toggleFavorite,
      checkinFor,
      addCheckin,
      addReview,
      setName,
      setDemoGeo,
      reset,
      toast,
      notify,
      backend,
      setBackend,
    }),
    [
      state,
      isFavorite,
      toggleFavorite,
      checkinFor,
      addCheckin,
      addReview,
      setName,
      setDemoGeo,
      reset,
      toast,
      notify,
      backend,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore должен использоваться внутри StoreProvider')
  return ctx
}
