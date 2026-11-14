import { ref } from 'vue'

const media = window.matchMedia('(prefers-color-scheme: dark)')
let stored = null
try { stored = localStorage.getItem('gpl-theme') } catch {}
export const theme = ref(stored || (media.matches ? 'dark' : 'light'))
document.documentElement.dataset.theme = theme.value

export function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme.value
  try { localStorage.setItem('gpl-theme', theme.value) } catch {}
}
