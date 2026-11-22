import { useId, type ReactNode } from 'react'
import type { Cover as CoverType } from '../types'

interface CoverArtProps {
  cover: CoverType
  className?: string
}

const LIGHT = 'rgba(255, 253, 248, 0.42)'
const LIGHT_SOFT = 'rgba(255, 253, 248, 0.24)'
const DARK = 'rgba(36, 29, 26, 0.10)'
const DARK_SOFT = 'rgba(36, 29, 26, 0.06)'

/** Декоративная обложка: градиент + геометрический узор, без внешних картинок (работает офлайн). */
export function CoverArt({ cover, className }: CoverArtProps) {
  const raw = useId()
  const id = raw.replace(/[:]/g, '')
  const grad = `grad-${id}`

  return (
    <svg
      className={`cover__art ${className ?? ''}`}
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={cover.from} />
          <stop offset="100%" stopColor={cover.to} />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${grad})`} />
      {shapes(cover.pattern)}
    </svg>
  )
}

function shapes(pattern: CoverType['pattern']): ReactNode {
  switch (pattern) {
    case 'waves':
      return (
        <>
          <circle cx="322" cy="64" r="44" fill={LIGHT} />
          <path d="M0 206c62-30 120 26 200-4s138-28 200 4v94H0Z" fill={LIGHT_SOFT} />
          <path d="M0 238c66-26 130 30 208 0s132-22 192 6v56H0Z" fill={DARK} />
          <path
            d="M0 176c74-18 128 22 200-2s148-24 200 10"
            fill="none"
            stroke={DARK_SOFT}
            strokeWidth="2"
          />
        </>
      )
    case 'grid':
      return (
        <>
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={i * 50}
              y1="0"
              x2={i * 50}
              y2="300"
              stroke={DARK_SOFT}
              strokeWidth="1.4"
            />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <line
              key={`h${i}`}
              x1="0"
              y1={i * 50}
              x2="400"
              y2={i * 50}
              stroke={DARK_SOFT}
              strokeWidth="1.4"
            />
          ))}
          <circle cx="300" cy="84" r="58" fill={LIGHT} />
          <rect x="36" y="150" width="120" height="120" rx="14" fill={DARK} opacity="0.5" />
        </>
      )
    case 'arcs':
      return (
        <>
          <circle cx="96" cy="268" r="190" fill="none" stroke={LIGHT} strokeWidth="26" />
          <circle cx="96" cy="268" r="132" fill="none" stroke={DARK_SOFT} strokeWidth="20" />
          <circle cx="96" cy="268" r="76" fill="none" stroke={LIGHT_SOFT} strokeWidth="14" />
          <circle cx="330" cy="52" r="18" fill={LIGHT} />
        </>
      )
    case 'blobs':
      return (
        <>
          <ellipse cx="310" cy="70" rx="120" ry="86" fill={LIGHT} transform="rotate(-18 310 70)" />
          <ellipse cx="120" cy="236" rx="150" ry="92" fill={DARK} transform="rotate(12 120 236)" />
          <circle cx="232" cy="150" r="42" fill="none" stroke={LIGHT_SOFT} strokeWidth="10" />
        </>
      )
    case 'stripes':
      return (
        <>
          {Array.from({ length: 14 }, (_, i) => (
            <line
              key={i}
              x1={-60 + i * 44}
              y1="300"
              x2={60 + i * 44}
              y2="0"
              stroke={i % 2 === 0 ? DARK_SOFT : LIGHT_SOFT}
              strokeWidth="12"
            />
          ))}
          <circle cx="318" cy="62" r="34" fill={LIGHT} />
        </>
      )
    case 'noise':
    default:
      return (
        <>
          <circle cx="300" cy="92" r="86" fill={LIGHT_SOFT} />
          <circle cx="300" cy="92" r="46" fill={LIGHT} />
          <path
            d="M0 232c58-20 92 16 148-4s84-30 132-10 76 18 120 2v80H0Z"
            fill={DARK}
          />
          <path
            d="M0 268c70-14 112 12 166-2s96-16 140-2 68 10 94 2v34H0Z"
            fill={DARK_SOFT}
          />
        </>
      )
  }
}

interface CoverProps {
  cover: CoverType
  glyph?: ReactNode
  chip?: ReactNode
  action?: ReactNode
  className?: string
  children?: ReactNode
}

export function Cover({ cover, glyph, chip, action, className, children }: CoverProps) {
  return (
    <div className={`cover ${className ?? ''}`}>
      <CoverArt cover={cover} />
      {glyph ? <span className="cover__glyph">{glyph}</span> : null}
      {chip ? <span className="cover__chip">{chip}</span> : null}
      {action ? <div className="cover__fav">{action}</div> : null}
      {children}
    </div>
  )
}
