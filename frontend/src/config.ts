export const SITE = {
  name: 'Вокруг НСК',
  tagline: 'гид по необычному Новосибирску',
  city: 'Новосибирск',
  
  checkinRadius: 200,

  socials: [
    { id: 'vk', label: 'ВКонтакте', href: 'https://vk.com/', icon: 'vk' as const },
    { id: 'tg', label: 'Telegram', href: 'https://t.me/', icon: 'telegram' as const },
    { id: 'yt', label: 'YouTube', href: 'https://youtube.com/', icon: 'youtube' as const },
  ],
  partners: ['Отели-партнёры', 'Музеи НСК', 'Кофейни города'],
} as const

export const STORAGE_KEY = 'vokrug-nsk:v1'
