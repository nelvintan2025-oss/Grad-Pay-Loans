<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { MEASURES, UNIVERSITIES, UNI_SHORT, programmes, history, forecast, fmt } from '../lib/calc'
import { selection } from '../lib/state'

const router = useRouter()
const gradYears = Array.from({ length: 10 }, (_, i) => 2026 + i)
const uniFilter = ref(-1)
const query = ref('')
const showWeak = ref(true)

const all = computed(() => {
  const out = []
  UNIVERSITIES.forEach((_, u) => {
    for (const p of programmes(u, { onlyLatest: true })) {
      const f = forecast(history(u, p), selection.measure, selection.gradYear)
      if (f.value != null) out.push({ uni: u, degree: p, ...f })
    }
  })
  return out.sort((a, b) => b.value - a.value)
})

const list = computed(() => {
  const q = query.value.trim().toLowerCase()
  return all.value.filter((r) => (uniFilter.value < 0 || r.uni === uniFilter.value) && (!q || r.degree.toLowerCase().includes(q)) && (showWeak.value || r.level === 'good'))
})
const max = computed(() => Math.max(...all.value.map((r) => r.value)))

function open(r) {
  selection.uni = r.uni
  selection.degree = r.degree
  router.push('/forecast')
}
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div class="eyebrow">Compare</div>
      <h1>Every programme, ranked by forecast pay</h1>
      <p class="muted">All NUS, NTU and SMU programmes surveyed in 2025 with at least 3 years of data. Click a row to open its full forecast.</p>
    </div>

    <div class="card" style="display: flex; flex-wrap: wrap; gap: 12px; align-items: end">
      <label class="field" style="margin: 0; flex: 1 1 200px">
        <span>University</span>
        <div class="seg">
          <button :class="{ on: uniFilter === -1 }" @click="uniFilter = -1">All</button>
          <button v-for="(u, i) in UNI_SHORT" :key="u" :class="{ on: uniFilter === i }" @click="uniFilter = i">{{ u }}</button>
        </div>
      </label>
      <label class="field" style="margin: 0; flex: 1 1 160px">
        <span>Measure</span>
        <select v-model="selection.measure"><option v-for="m in MEASURES" :key="m.key" :value="m.key">{{ m.label }}</option></select>
      </label>
      <label class="field" style="margin: 0; flex: 0 1 120px">
        <span>Grad year</span>
        <select v-model.number="selection.gradYear"><option v-for="y in gradYears" :key="y">{{ y }}</option></select>
      </label>
      <label class="field" style="margin: 0; flex: 2 1 200px">
        <span>Search</span>
        <input type="search" v-model="query" placeholder="e.g. computer, law, business" style="width: 100%; font: inherit; color: var(--text); background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 9px 12px" />
      </label>
      <label class="small muted" style="display: flex; gap: 6px; align-items: center; padding-bottom: 10px">
        <input type="checkbox" v-model="showWeak" /> Include weak trends
      </label>
    </div>

    <section class="card">
      <div class="card-head">
        <h2>{{ list.length }} programmes</h2>
        <div class="small muted" style="display: flex; gap: 14px">
          <span v-for="(u, i) in UNI_SHORT" :key="u" style="display: flex; align-items: center; gap: 6px"><span class="swatch" :style="{ background: `var(--series-${i + 1})` }"></span>{{ u }}</span>
        </div>
      </div>
      <ol class="bars">
        <li v-for="(r, i) in list" :key="r.uni + r.degree" @click="open(r)" :title="`${UNIVERSITIES[r.uni]} · ${r.degree}: ${fmt.money(r.value)} (R² ${fmt.num(r.r2)})`">
          <span class="rank tnum">{{ i + 1 }}</span>
          <div class="name">
            <div class="deg">{{ r.degree }}</div>
            <div class="track"><div class="fill" :style="{ width: (r.value / max) * 100 + '%', background: `var(--series-${r.uni + 1})` }"></div></div>
          </div>
          <span class="val tnum">{{ fmt.money(r.value) }}</span>
          <span class="pill" :class="r.level" style="justify-self: end">{{ r.level === 'good' ? 'Strong' : 'Caution' }}</span>
        </li>
      </ol>
      <p v-if="!list.length" class="muted">No programmes match.</p>
    </section>
  </div>
</template>

<style scoped>
.bars { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
.bars li { display: grid; grid-template-columns: 32px 1fr 80px 76px; gap: 12px; align-items: center; padding: 8px 8px; border-radius: 8px; cursor: pointer; }
.bars li:hover { background: var(--surface-2); }
.rank { color: var(--text-3); font-size: 13px; text-align: right; }
.name { min-width: 0; }
.deg { font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.track { height: 8px; margin-top: 5px; }
.fill { height: 100%; border-radius: 0 4px 4px 0; }
.val { font-weight: 600; text-align: right; }
@media (max-width: 560px) {
  .bars li { grid-template-columns: 24px 1fr 72px; }
  .bars li .pill { display: none; }
}
</style>
