<script setup>
import { computed, reactive } from 'vue'
import ProgrammePicker from '../components/ProgrammePicker.vue'
import Heatmap from '../components/Heatmap.vue'
import { MEASURES, LOAN_SCHEMES, history, forecast, loanResult, fmt } from '../lib/calc'
import { selection } from '../lib/state'

const gradYears = Array.from({ length: 10 }, (_, i) => 2026 + i)
const startYears = Array.from({ length: 11 }, (_, i) => 2013 + i)
const shares = [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4]
const tableBStarts = [2013, 2015, 2017, 2019, 2021]
const tableMeasures = MEASURES.slice(0, 3)

// editable copy of the loan schemes (defaults = group PART 2 model)
const schemes = reactive(LOAN_SCHEMES.map((s) => ({ ...s })))
function resetSchemes() { LOAN_SCHEMES.forEach((s, i) => Object.assign(schemes[i], s)) }
const scheme = computed(() => schemes[selection.scheme])

const rows = computed(() => history(selection.uni, selection.degree))
const fc = (measure, gradYear = selection.gradYear, start = selection.startYear) => forecast(rows.value, measure, gradYear, start)
const base = computed(() => fc(selection.measure))
const result = computed(() => loanResult({ salary: base.value.value, share: selection.share, cpf: selection.cpf, ...scheme.value }))

// Table A1: years to repay, share × measure  {=TABLE(B6,B10)}
const tableA1 = computed(() =>
  shares.map((share) => tableMeasures.map((m) => loanResult({ salary: fc(m.key).value, share, cpf: selection.cpf, ...scheme.value })?.years ?? null)),
)
// Table B: salary forecast, grad year × trend start year  {=TABLE(B8,B7)}
const tableB = computed(() => gradYears.map((g) => tableBStarts.map((s) => fc(selection.measure, g, s).value)))

const measureLabel = computed(() => MEASURES.find((m) => m.key === selection.measure).label)
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div class="eyebrow">Sensitivity analysis · Salary × loan</div>
      <h1>How fast can you clear your student loan?</h1>
      <p class="muted">Put a fixed share of take-home pay towards the loan each month and see how many years it takes. The tables recalculate the way Excel's what-if Data Tables do.</p>
    </div>

    <div class="layout-side">
      <aside class="card sticky">
        <ProgrammePicker />
        <label class="field">
          <span>Salary measure</span>
          <select v-model="selection.measure">
            <option v-for="m in MEASURES" :key="m.key" :value="m.key">{{ m.label }}</option>
          </select>
        </label>
        <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 10px">
          <label class="field">
            <span>Grad year</span>
            <select v-model.number="selection.gradYear"><option v-for="y in gradYears" :key="y">{{ y }}</option></select>
          </label>
          <label class="field">
            <span>Trend from</span>
            <select v-model.number="selection.startYear"><option v-for="y in startYears" :key="y">{{ y }}</option></select>
          </label>
        </div>
        <label class="field">
          <span>Loan scheme</span>
          <select v-model.number="selection.scheme">
            <option v-for="(s, i) in schemes" :key="s.name" :value="i">{{ s.name }}</option>
          </select>
        </label>
        <label class="field">
          <span>Share of take-home pay for repayment</span>
          <input type="range" min="0.05" max="0.5" step="0.01" v-model.number="selection.share" />
          <div class="range-row"><span>5%</span><strong style="color: var(--text)">{{ fmt.pct(selection.share, 0) }}</strong><span>50%</span></div>
        </label>
        <label class="field">
          <span>CPF employee contribution</span>
          <input type="range" min="0" max="0.2" step="0.01" v-model.number="selection.cpf" />
          <div class="range-row"><span>0%</span><strong style="color: var(--text)">{{ fmt.pct(selection.cpf, 0) }}</strong><span>20%</span></div>
        </label>
      </aside>

      <div class="grid">
        <div class="grid grid-4">
          <div class="card stat">
            <div class="label">Forecast gross salary ({{ selection.gradYear }})</div>
            <div class="value">{{ base.value == null ? '—' : fmt.money(base.value) }}</div>
            <div class="small muted">{{ measureLabel }} · {{ base.count }} years of data</div>
          </div>
          <div class="card stat">
            <div class="label">Monthly repayment</div>
            <div class="value">{{ result ? fmt.money(result.monthly) : '—' }}</div>
            <div class="small muted">{{ fmt.pct(selection.share, 0) }} of {{ result ? fmt.money(result.takeHome) : 'n/a' }} take-home</div>
          </div>
          <div class="card stat">
            <div class="label">Years to repay</div>
            <div class="value">{{ result ? fmt.years(result.years) : '—' }}</div>
            <div v-if="result">
              <span class="pill" :class="result.withinTenure ? 'good' : 'bad'">{{ result.withinTenure ? 'Within max tenure' : result.years == null ? "Doesn't cover interest" : 'Exceeds max tenure' }}</span>
            </div>
          </div>
          <div class="card stat">
            <div class="label">PMT over full {{ scheme.tenure }}-month tenure</div>
            <div class="value">{{ fmt.money(result?.tenurePmt ?? null) }}</div>
            <div class="small muted">{{ result ? fmt.pct(result.tenureShare) + ' of take-home pay' : 'n/a' }}</div>
          </div>
        </div>

        <div v-if="base.value == null" class="callout">This programme has fewer than 3 years of data from {{ selection.startYear }}, so there's no forecast. Try an earlier "Trend from" year or another programme.</div>

        <section class="card">
          <div class="card-head">
            <div>
              <h2>Table A1 · Years to repay</h2>
              <p class="small muted">Share of take-home pay × salary measure, for the {{ scheme.short }} loan. Stronger blue = longer.</p>
            </div>
            <code>{=TABLE(B6,B10)}</code>
          </div>
          <Heatmap
            corner="Share ↓ / Measure →"
            :cols="tableMeasures.map((m) => ({ key: m.key, label: m.label }))"
            :rows="shares.map((s) => ({ key: s, label: fmt.pct(s, 0) }))"
            :values="tableA1"
            :format="fmt.years"
            :selected="{ row: selection.share, col: selection.measure }"
          />
          <p class="small muted" style="margin-top: 10px">"Never" means the monthly amount doesn't even cover the interest.</p>
        </section>

        <section class="card">
          <div class="card-head">
            <div>
              <h2>Table B · Salary forecast stability</h2>
              <p class="small muted">{{ measureLabel }} forecast using only data from each start year onwards. Stronger blue = lower salary. Big swings across a row mean the forecast depends on which years you trust.</p>
            </div>
            <code>{=TABLE(B8,B7)}</code>
          </div>
          <Heatmap
            corner="Grad year ↓ / Data from →"
            :cols="tableBStarts.map((s) => ({ key: s, label: String(s) }))"
            :rows="gradYears.map((g) => ({ key: g, label: String(g) }))"
            :values="tableB"
            :format="(v) => fmt.money(v)"
            :lower-is-better="false"
            null-label="n/a"
            :selected="{ row: selection.gradYear, col: selection.startYear }"
          />
        </section>

        <section class="card">
          <div class="card-head">
            <div>
              <h2>Loan schemes</h2>
              <p class="small muted">Defaults come from the group's PART 2 sheets (SMU, $39,800 financed, graduating June 2030, repayment from August 2030). Edit any value to try your own case.</p>
            </div>
            <button class="seg" style="padding: 6px 12px; cursor: pointer; font: inherit; font-size: 13px; color: var(--text)" @click="resetSchemes">Reset</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Scheme</th><th>Balance at repayment start</th><th>Annual rate (%)</th><th>Max tenure (months)</th></tr></thead>
              <tbody>
                <tr v-for="(s, i) in schemes" :key="s.name" :class="{ hl: i === selection.scheme }">
                  <td>{{ s.name }}</td>
                  <td><input type="number" step="100" min="0" v-model.number="s.balance" style="max-width: 130px; text-align: right" /></td>
                  <td><input type="number" step="0.1" min="0" :value="+(s.rate * 100).toFixed(3)" @input="s.rate = ($event.target.valueAsNumber || 0) / 100" style="max-width: 90px; text-align: right" /></td>
                  <td><input type="number" step="12" min="1" v-model.number="s.tenure" style="max-width: 90px; text-align: right" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
