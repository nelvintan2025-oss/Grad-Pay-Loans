<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { theme, toggleTheme } from './lib/theme'

const links = [
  { to: '/forecast', label: 'Forecast' },
  { to: '/loan', label: 'Loan' },
  { to: '/compare', label: 'Compare' },
  { to: '/method', label: 'Method' },
]
const open = ref(false)
const route = useRoute()
watch(() => route.path, () => (open.value = false))
</script>

<template>
  <header class="top">
    <div class="container bar">
      <RouterLink to="/" class="brand">
        <img src="/favicon.svg" alt="" width="26" height="26" />
        <span>Grad Pay &amp; Loans</span>
      </RouterLink>
      <nav :class="{ open }">
        <RouterLink v-for="l in links" :key="l.to" :to="l.to">{{ l.label }}</RouterLink>
      </nav>
      <div class="actions">
        <button class="icon" @click="toggleTheme" :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
          <svg v-if="theme === 'dark'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
        </button>
        <button class="icon menu" @click="open = !open" aria-label="Menu">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        </button>
      </div>
    </div>
  </header>

  <main class="container">
    <RouterView />
  </main>

  <footer class="container foot small muted">
    Data: Graduate Employment Survey 2013–2025 (MOE / data.gov.sg), NUS, NTU and SMU. Loan figures from the COR1305 G4 Group 3 model.
    Built from Jack's Excel work for COR1305. Forecasts are simple linear trends, not financial advice.
  </footer>
</template>

<style scoped>
.top { position: sticky; top: 0; z-index: 10; background: color-mix(in srgb, var(--bg) 85%, transparent); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); }
.bar { display: flex; align-items: center; gap: 24px; height: 60px; }
.brand { display: flex; align-items: center; gap: 10px; font-weight: 700; color: var(--text); text-decoration: none; white-space: nowrap; }
nav { display: flex; gap: 4px; flex: 1; }
nav a { color: var(--text-2); text-decoration: none; padding: 6px 12px; border-radius: 8px; font-weight: 500; font-size: 14px; }
nav a:hover { color: var(--text); background: var(--surface-2); }
nav a.router-link-active { color: var(--text); background: var(--surface-2); }
.actions { display: flex; gap: 6px; margin-left: auto; }
.icon { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface); color: var(--text); cursor: pointer; }
.menu { display: none; }
.foot { padding: 24px 16px 40px; border-top: 1px solid var(--border); }
@media (max-width: 680px) {
  .menu { display: grid; }
  nav { display: none; position: absolute; top: 60px; left: 0; right: 0; flex-direction: column; background: var(--surface); border-bottom: 1px solid var(--border); padding: 8px 16px 12px; }
  nav.open { display: flex; }
}
</style>
