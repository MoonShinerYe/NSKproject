/**
 * Превращает путь из seed.json в URL, который работает и в корне, и в подпапке
 * (GitHub Pages: /NSKproject/). Внешние ссылки и data: возвращаются как есть.
 */
export function imageUrl(src?: string): string | undefined {
  if (!src || !src.trim()) return undefined
  const value = src.trim()
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) return value
  return `${import.meta.env.BASE_URL}${value.replace(/^\.?\//, '')}`
}
