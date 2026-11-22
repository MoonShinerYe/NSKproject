import type { SVGProps } from 'react'

export type IconName =
  | 'pin'
  | 'heart'
  | 'star'
  | 'compass'
  | 'shuffle'
  | 'clock'
  | 'wallet'
  | 'users'
  | 'walk'
  | 'bus'
  | 'coffee'
  | 'museum'
  | 'park'
  | 'camera'
  | 'ticket'
  | 'gift'
  | 'check'
  | 'chevron'
  | 'search'
  | 'filter'
  | 'close'
  | 'share'
  | 'route'
  | 'trophy'
  | 'user'
  | 'sparkles'
  | 'arrow'
  | 'moon'
  | 'sun'
  | 'instagram'
  | 'vk'
  | 'telegram'
  | 'youtube'
  | 'map'

const paths: Record<IconName, string> = {
  pin: 'M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  heart: 'M12 20s-7-4.4-7-9.4A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7 3.6C19 15.6 12 20 12 20Z',
  star: 'm12 3.6 2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3.6Z',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5 5-2Z',
  shuffle: 'M16 4h4v4 M20 4l-6 6 M4 20l6-6 M16 20h4v-4 M4 4l5 5',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5l3 2',
  wallet: 'M4 8.5A2.5 2.5 0 0 1 6.5 6H19v12H6.5A2.5 2.5 0 0 1 4 15.5v-7Z M16 12h2',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z M3 20c0-3 2.7-5 6-5s6 2 6 5 M17 4.5a3 3 0 0 1 0 6 M18 15c2.2.4 3.5 2 3.5 4.5',
  walk: 'M13 5.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z M10 21l2.5-6-2-3 1-5 3 2 2.5 3 M9 13l-2.5 3',
  bus: 'M5 17V6.5A1.5 1.5 0 0 1 6.5 5h11A1.5 1.5 0 0 1 19 6.5V17 M5 12h14 M7 20v-3 M17 20v-3 M8 15h.01 M16 15h.01',
  coffee: 'M5 8h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z M16 9h2a2.5 2.5 0 0 1 0 5h-2 M4 21h13',
  museum: 'M3 10 12 4l9 6 M5 10v9 M9 10v9 M15 10v9 M19 10v9 M3 21h18',
  park: 'M12 21v-6 M12 3 6 13h12L12 3Z M12 8 8 16h8L12 8Z',
  camera: 'M4 8h3l1.5-2h7L17 8h3v11H4V8Z M12 16.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  ticket: 'M4 9V6h16v3a3 3 0 0 0 0 6v3H4v-3a3 3 0 0 0 0-6Z M13 6v12',
  gift: 'M4 11h16v9H4v-9Z M3 8h18v3H3V8Z M12 8v12 M12 8C9 8 7.5 6.6 7.5 5.2 7.5 4 8.5 3 10 3c1.7 0 2 2.3 2 5Z M12 8c3 0 4.5-1.4 4.5-2.8C16.5 4 15.5 3 14 3c-1.7 0-2 2.3-2 5Z',
  check: 'm5 12.5 4.5 4.5L19 7',
  chevron: 'm9 6 6 6-6 6',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z m5.5-2.5L21 21',
  filter: 'M4 6h16 M7 12h10 M10 18h4',
  close: 'm6 6 12 12 M18 6 6 18',
  share: 'M12 15V4 M8 8l4-4 4 4 M5 14v6h14v-6',
  route: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M8 17h5a4 4 0 0 0 0-8H9',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0V4Z M8 6H5v2a3 3 0 0 0 3 3 M16 6h3v2a3 3 0 0 1-3 3 M10 17h4 M9 21h6 M12 13v4',
  user: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5',
  sparkles: 'm12 3 1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z M18 16l.9 2.1L21 19l-2.1.9L18 22l-.9-2.1L15 19l2.1-.9L18 16Z',
  arrow: 'M4 12h15 M13 6l6 6-6 6',
  moon: 'M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.5 1.5 M17.5 17.5 19 19 M19 5l-1.5 1.5 M6.5 17.5 5 19',
  instagram: 'M7.5 3.5h9A4 4 0 0 1 20.5 7.5v9a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4Z M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z M17.2 6.8h.01',
  vk: 'M13.2 17c-5 0-8.2-3.5-8.3-9.3h2.6c.1 4.3 2.1 6.1 3.5 6.5V7.7h2.5v3.9c1.4-.2 2.8-1.8 3.3-3.9h2.5c-.4 2.4-1.9 4-3 4.7 1.1.6 2.8 2 3.5 4.6h-2.8c-.5-1.6-1.8-2.9-3.5-3.1V17h-.3Z',
  telegram: 'M21 4.5 2.9 11.6c-.9.3-.9 1.5.1 1.7l4.6 1.2 1.7 5.2c.3.8 1.3 1 1.8.3l2.5-2.9 4.6 3.4c.7.5 1.7.1 1.9-.8L22 5.6c.2-.9-.7-1.5-1-1.1Z M8 14l9.5-6.5-7.7 7.6',
  youtube: 'M3 8.5A2.5 2.5 0 0 1 5.5 6h13A2.5 2.5 0 0 1 21 8.5v7a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 15.5v-7Z M10 9.5l5 2.5-5 2.5v-5Z',
  map: 'M9 4 3 6.5v14L9 18l6 2 6-2.5v-14L15 6 9 4Z M9 4v14 M15 6v14',
}

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName
  size?: number
}

export function Icon({ name, size = 20, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  )
}
