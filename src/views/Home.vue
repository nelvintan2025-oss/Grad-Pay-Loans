<script setup>
import { computed } from 'vue'
import { UNIVERSITIES, UNI_SHORT, history, forecast, loanResult, LOAN_SCHEMES, fmt } from '../lib/calc'
import ges from '../data/ges.json'
import { selection } from '../lib/state'

const programmeCount = new Set(ges.rows.map((r) => r[1] + '|' + r[3])).size
const f = computed(() => forecast(history(selection.uni, selection.degree), 'grossMedian', selection.gradYear))
const loan = computed(() => loanResult({ salary: f.value.value, share: selection.share, cpf: selection.cpf, ...LOAN_SCHEMES[selection.scheme] }))

const cards = [
  { to: '/forecast', title: 'Salary forecast', body: 'Linear-trend forecasts of 25th, median, 75th and mean starting pay for any programme and graduation year.', tag: 'Learning Tab' },
  { to: '/loan', title: 'Loan sensitivity', body: 'How many years it takes to repay HESL, CPF, OCBC or POSB loans at different salaries and repayment shares.', tag: 'Sensitivity Analysis' },
  { to: '/compare', title: 'Compare programmes', body: 'Rank every NUS, NTU and SMU programme by forecast pay and spot which forecasts you can trust.', tag: 'GES 2013–2025' },
]
</script>

<template>
  <div class="page">
    <section class="hero">
      <div class="eyebrow">COR1305 · Spreadsheet Modelling</div>
      <h1>Know your starting pay before you take the loan.</h1>
      <p class="muted lead">
        Thirteen years of Graduate Employment Survey data for {{ programmeCount }} programmes at NUS, NTU and SMU, turned into salary forecasts and a student-loan repayment model. Every number here is recalculated live from the same formulas as the Excel model.
      </p>
      <div class="cta">
        <RouterLink to="/forecast" class="btn primary">Forecast my salary</RouterLink>
        <RouterLink to="/loan" class="btn">Test my loan</RouterLink>
      </div>
    </section>

    <section class="card snapshot">
      <div class="small muted">Your current pick · {{ UNI_SHORT[selection.uni] }} {{ selection.degree }}, graduating {{ selection.gradYear }}</div>
      <div class="grid grid-4" style="margin-top: 12px">
        <div class="stat"><div class="label">Forecast median salary</div><div class="value">{{ f.value == null ? '—' : fmt.money(f.value) }}</div><div class="small muted">{{ fmt.signedPct(f.change) }} vs 2025</div></div>
        <div class="stat"><div class="label">Trend fit</div><div class="value">{{ f.r2 == null ? '—' : 'R² ' + fmt.num(f.r2) }}</div><span class="pill" :class="f.level">{{ f.check }}</span></div>
        <div class="stat"><div class="label">{{ LOAN_SCHEMES[selection.scheme].short }} loan repaid in</div><div class="value">{{ loan ? fmt.years(loan.years) : '—' }}</div><div class="small muted">at {{ fmt.pct(selection.share, 0) }} of take-home pay</div></div>
        <div class="stat"><div class="label">Monthly repayment</div><div class="value">{{ loan ? fmt.money(loan.monthly) : '—' }}</div><div class="small muted">after {{ fmt.pct(selection.cpf, 0) }} CPF</div></div>
      </div>
    </section>

    <section class="grid grid-4" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))">
      <RouterLink v-for="c in cards" :key="c.to" :to="c.to" class="card link-card">
        <span class="eyebrow">{{ c.tag }}</span>
        <h2>{{ c.title }}</h2>
        <p class="muted">{{ c.body }}</p>
        <span class="go">Open →</span>
      </RouterLink>
    </section>
  </div>
</template>

<style scoped>
.hero { display: grid; gap: 14px; padding: 32px 0 8px; max-width: 760px; }
.hero h1 { font-size: clamp(32px, 6vw, 52px); letter-spacing: -0.03em; }
.lead { font-size: 17px; }
.cta { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 6px; }
.btn { text-decoration: none; padding: 10px 18px; border-radius: 10px; font-weight: 600; border: 1px solid var(--border); color: var(--text); background: var(--surface); }
.btn.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
.link-card { text-decoration: none; color: inherit; display: grid; gap: 8px; transition: border-color 0.15s, transform 0.15s; }
.link-card:hover { border-color: var(--accent); transform: translateY(-2px); }
.go { color: var(--accent); font-weight: 600; font-size: 14px; margin-top: 4px; }
</style>
