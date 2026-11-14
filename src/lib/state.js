// Shared selection so the pages stay in sync (pick once, see it everywhere).
import { reactive, watch } from 'vue'

const KEY = 'gpl-selection'
let saved = {}
try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') } catch {}

export const selection = reactive({
  uni: 2,
  degree: 'Economics',
  gradYear: 2029,
  startYear: 2013,
  measure: 'grossMedian',
  scheme: 2,
  share: 0.2,
  cpf: 0.2,
  ...saved,
})

watch(selection, (v) => {
  try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {}
}, { deep: true })
