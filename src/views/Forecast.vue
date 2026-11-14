<script setup>
import { computed } from 'vue'
import ProgrammePicker from '../components/ProgrammePicker.vue'
import LineChart from '../components/LineChart.vue'
import { MEASURES, UNIVERSITIES, history, forecast, fmt, FIRST_YEAR } from '../lib/calc'
import { selection } from '../lib/state'

const gradYears = Array.from({ length: 10 }, (_, i) => 2026 + i)
const rows = computed(() => history(selection.uni, selection.degree))
const boxes = computed(() => MEASURES.map((m) => ({ ...m, f: forecast(rows.value, m.key, selection.gradYear) })))

const series = computed(() => {
  const out = []
  for (const b of boxes.value) {
    const color = `--series-${b.slot}`
    out.push({ label: b.label, color, points: rows.value.filter((r) => r[b.key] != null).map((r) => ({ x: r.year, y: r[b.key] })) })
    if (b.f.fit) {
      const x0 = rows.value.find((r) => r[b.key] != null).year
      out.push({ label: `${b.label} trend`, color, dashed: true, hideLegend: true, points: [{ x: x0, y: b.f.fit.at(x0) }, { x: selection.gradYear, y: b.f.value }] })
    }
  }
  return out
})

const emp = computed(() => rows.value.at(-1))
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div class="eyebrow">Learning Tab · Salary forecast</div>
      <h1>What will you earn when you graduate?</h1>
      <p class="muted">Pick a programme and the year you expect to graduate. Each salary measure gets a straight-line trend through every survey year since {{ FIRST_YEAR }}, the same as Excel's <code>TREND</code>.</p>
    </div>

    <div class="layout-side">
      <aside class="card sticky">
        <ProgrammePicker />
        <label class="field">
          <span>Expected graduation year</span>
          <select v-model.number="selection.gradYear">
            <option v-for="y in gradYears" :key="y" :value="y">{{ y }}</option>
          </select>
        </label>
        <div v-if="emp" class="small muted" style="border-top: 1px solid var(--border); padding-top: 12px">
          Latest survey ({{ emp.year }}): <strong style="color: var(--text)">{{ emp.empOverall ?? 'n/a' }}%</strong> employed overall,
          <strong style="color: var(--text)">{{ emp.empFtPerm ?? 'n/a' }}%</strong> in full-time permanent jobs.
        </div>
      </aside>

      <div class="grid">
        <div class="grid grid-4">
          <div v-for="b in boxes" :key="b.key" class="card stat">
            <div class="label"><span class="swatch" :style="{ background: `var(--series-${b.slot})` }"></span>{{ b.label }}</div>
            <div class="value">{{ b.f.value == null ? '—' : fmt.money(b.f.value) }}</div>
            <div class="small muted tnum">
              2025 actual {{ fmt.money(b.f.actual2025) }} · <span :style="{ color: b.f.change >= 0 ? 'var(--good)' : 'var(--bad)' }">{{ fmt.signedPct(b.f.change) }}</span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center; margin-top: 10px; flex-wrap: wrap">
              <span class="pill" :class="b.f.level">{{ b.f.check }}</span>
              <span v-if="b.f.r2 != null" class="small muted tnum">R² {{ fmt.num(b.f.r2) }}</span>
            </div>
          </div>
        </div>

        <section class="card">
          <div class="card-head">
            <h2>Gross monthly salary, {{ FIRST_YEAR }}–{{ selection.gradYear }}</h2>
            <span class="small muted">Solid = survey data · dashed = trend to {{ selection.gradYear }}</span>
          </div>
          <LineChart :series="series" :y-format="(v) => '$' + Math.round(v).toLocaleString()" :height="360" />
        </section>

        <section class="card">
          <div class="card-head">
            <h2>Survey data</h2>
            <span class="small muted">{{ UNIVERSITIES[selection.uni] }} · {{ selection.degree }}</span>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Year</th><th>Employed</th><th>FT perm</th><th>25th</th><th>Median</th><th>75th</th><th>Mean</th></tr></thead>
              <tbody>
                <tr v-for="r in rows" :key="r.year">
                  <td>{{ r.year }}</td>
                  <td>{{ r.empOverall != null ? r.empOverall + '%' : 'n/a' }}</td>
                  <td>{{ r.empFtPerm != null ? r.empFtPerm + '%' : 'n/a' }}</td>
                  <td>{{ fmt.money(r.gross25) }}</td>
                  <td>{{ fmt.money(r.grossMedian) }}</td>
                  <td>{{ fmt.money(r.gross75) }}</td>
                  <td>{{ fmt.money(r.grossMean) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
