<script setup>
const rows = [
  { what: 'Salary forecast', excel: 'TREND(FILTER(y,ISNUMBER(y)),FILTER(x,ISNUMBER(y)),gradYear)', js: 'Least-squares line through every survey year with data, evaluated at the graduation year.' },
  { what: 'Fit quality', excel: 'RSQ(y, x)', js: 'R² of the same line. 0.6 or more counts as a strong trend.' },
  { what: 'Trend check', excel: 'IF(COUNT<3,"Not enough data",IF(COUNT<5,"Limited data",IF(R²>=0.6,"Strong","Weak")))', js: 'Same three thresholds.' },
  { what: 'Take-home pay', excel: 'salary × (1 − CPF)', js: 'Gross minus the 20% employee CPF contribution by default.' },
  { what: 'Years to repay', excel: 'NPER(rate/12, −payment, balance)/12', js: '"Never" when the payment is no more than one month of interest.' },
  { what: 'Max-tenure PMT', excel: 'PMT(rate/12, tenure, −balance)', js: 'Instalment needed to finish exactly at the scheme’s max tenure.' },
  { what: 'Table A1', excel: '{=TABLE(B6,B10)}', js: 'Recomputes years-to-repay for each salary measure × repayment share.' },
  { what: 'Table B', excel: '{=TABLE(B8,B7)}', js: 'Recomputes the forecast for each trend start year × graduation year.' },
]
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div class="eyebrow">Method</div>
      <h1>From spreadsheet to website</h1>
      <p class="muted">This site rebuilds the Learning Tab, Data-L and Sensitivity Analysis sheets in JavaScript. The results match the workbook to the cent (for example SMU Economics, median, graduating 2029: $5,151.58 and 4.96 years on the OCBC loan).</p>
    </div>

    <section class="card">
      <h2 style="margin-bottom: 12px">Formulas</h2>
      <div class="table-wrap">
        <table class="method">
          <thead><tr><th>What</th><th>Excel</th><th>Notes</th></tr></thead>
          <tbody>
            <tr v-for="r in rows" :key="r.what">
              <td><strong>{{ r.what }}</strong></td>
              <td><code>{{ r.excel }}</code></td>
              <td class="muted">{{ r.js }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div class="grid grid-2">
      <section class="card">
        <h2 style="margin-bottom: 10px">Data</h2>
        <p class="muted">Graduate Employment Survey 2013–2024 from data.gov.sg, plus GES 2025 from the MOE reports, for NUS, NTU and SMU. Programme names were matched across years in the group's GES table so each programme keeps one continuous history. Honours and cum laude sub-rows are excluded.</p>
      </section>
      <section class="card">
        <h2 style="margin-bottom: 10px">Limitations</h2>
        <p class="muted">A straight line can't see shocks like 2020. Programmes with few survey years get "Limited data" warnings. Loan balances are the group model's base case (SMU fees, $39,800 financed, graduating June 2030); edit them on the Loan page for other cases.</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.method td { white-space: normal; vertical-align: top; text-align: left; }
.method td:nth-child(2) { min-width: 240px; }
</style>
