// Excel formulas recreated in JavaScript.
import ges from '../data/ges.json'

export const UNIVERSITIES = ges.universities
export const UNI_SHORT = ['NUS', 'NTU', 'SMU']

const C = Object.fromEntries(ges.columns.map((c, i) => [c, i]))

export const MEASURES = [
  { key: 'gross25', label: '25th percentile', excel: 'Gross Monthly 25 Percentile', slot: 1 },
  { key: 'grossMedian', label: 'Median', excel: 'Gross Monthly Median', slot: 2 },
  { key: 'gross75', label: '75th percentile', excel: 'Gross Monthly 75 Percentile', slot: 3 },
  { key: 'grossMean', label: 'Mean', excel: 'Gross Monthly Mean', slot: 4 },
]

export const FIRST_YEAR = 2013
export const LATEST_YEAR = 2025

/** Programmes offered by a university (any year), sorted A–Z. */
export function programmes(uniIdx, { onlyLatest = false } = {}) {
  const set = new Set()
  for (const r of ges.rows) {
    if (r[C.uni] === uniIdx && (!onlyLatest || r[C.year] === LATEST_YEAR)) set.add(r[C.degree])
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

/** All survey rows for one programme, sorted by year, as objects. */
export function history(uniIdx, degree) {
  return ges.rows
    .filter((r) => r[C.uni] === uniIdx && r[C.degree] === degree)
    .sort((a, b) => a[C.year] - b[C.year])
    .map((r) => Object.fromEntries(ges.columns.map((c, i) => [c, r[i]])))
}

/** Excel LINEST-style fit: slope, intercept and RSQ. */
export function linearFit(xs, ys) {
  const n = xs.length
  if (n < 2) return null
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let sxy = 0, sxx = 0, syy = 0
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my)
    sxx += (xs[i] - mx) ** 2
    syy += (ys[i] - my) ** 2
  }
  const slope = sxx === 0 ? 0 : sxy / sxx
  const intercept = my - slope * mx
  const r2 = sxx === 0 || syy === 0 ? 0 : (sxy * sxy) / (sxx * syy)
  return { slope, intercept, r2, n, at: (x) => intercept + slope * x }
}

/**
 * Forecast box from the Learning Tab:
 *   =IF(COUNT(y)<3,"Not enough data",TREND(FILTER(y,ISNUMBER(y)),FILTER(x,ISNUMBER(y)),gradYear))
 * plus RSQ, change vs 2025 actual and the trend check text.
 */
export function forecast(rows, measureKey, gradYear, startYear = FIRST_YEAR) {
  const pts = rows.filter((r) => r.year >= startYear && typeof r[measureKey] === 'number')
  const actual2025 = rows.find((r) => r.year === LATEST_YEAR)?.[measureKey] ?? null
  const count = pts.length
  if (count < 3) {
    return { count, value: null, r2: null, actual2025, change: null, fit: null, check: 'Not enough data (needs 3+ years)', level: 'none' }
  }
  const fit = linearFit(pts.map((p) => p.year), pts.map((p) => p[measureKey]))
  const value = fit.at(gradYear)
  let check, level
  if (count < 5) { check = 'Limited data: use with caution'; level = 'warn' }
  else if (fit.r2 >= 0.6) { check = 'Strong trend'; level = 'good' }
  else { check = 'Weak trend: use with caution'; level = 'warn' }
  return { count, value, r2: fit.r2, actual2025, change: actual2025 ? value / actual2025 - 1 : null, fit, check, level }
}

/** Excel PMT(rate, nper, -pv) – payment per period. */
export function pmt(rate, nper, pv) {
  if (nper <= 0) return null
  if (rate === 0) return pv / nper
  return (pv * rate) / (1 - (1 + rate) ** -nper)
}

/** Excel NPER(rate, -payment, pv) – number of periods. null = never repaid. */
export function nper(rate, payment, pv) {
  if (payment <= 0) return null
  if (rate === 0) return pv / payment
  if (payment <= pv * rate) return null
  return -Math.log(1 - (pv * rate) / payment) / Math.log(1 + rate)
}

/**
 * Loan schemes as modelled in the group's PART 2 sheets (balance at repayment
 * start = PART 2 - Loan Disbursement row 40; rate row 36; max tenure from
 * PART 2 - Loan Repayment row 6). Base case: SMU, $39,800 financing, grad Jun 2030.
 */
export const LOAN_SCHEMES = [
  { name: 'Higher Education Student Loan', short: 'HESL', balance: 36879.29, rate: 0.026, tenure: 120 },
  { name: 'CPF Education Loan', short: 'CPF', balance: 42030.12, rate: 0.025, tenure: 144 },
  { name: 'OCBC Education Loan - Standard', short: 'OCBC', balance: 43926.08, rate: 0.045, tenure: 96 },
  { name: 'POSB Further Study Assist Loan', short: 'POSB', balance: 43809.39, rate: 0.0438, tenure: 120 },
]

/** Sensitivity Analysis sheet, rows 14–23, as one function. */
export function loanResult({ salary, share, cpf, balance, rate, tenure }) {
  if (salary == null) return null
  const takeHome = salary * (1 - cpf)
  const monthly = takeHome * share
  const months = nper(rate / 12, monthly, balance)
  const years = months == null ? null : months / 12
  const tenurePmt = pmt(rate / 12, tenure, balance)
  return {
    takeHome,
    monthly,
    years,
    withinTenure: months != null && months <= tenure,
    tenurePmt,
    tenureShare: tenurePmt / takeHome,
    totalPaid: months == null ? null : monthly * months,
    totalInterest: months == null ? null : monthly * months - balance,
  }
}

export const fmt = {
  money: (v, d = 0) => (v == null || !isFinite(v) ? 'n/a' : '$' + v.toLocaleString('en-SG', { minimumFractionDigits: d, maximumFractionDigits: d })),
  pct: (v, d = 1) => (v == null || !isFinite(v) ? 'n/a' : (v * 100).toFixed(d) + '%'),
  signedPct: (v, d = 1) => (v == null || !isFinite(v) ? 'n/a' : (v >= 0 ? '+' : '') + (v * 100).toFixed(d) + '%'),
  num: (v, d = 2) => (v == null || !isFinite(v) ? 'n/a' : v.toFixed(d)),
  years: (v) => (v == null ? 'Never' : v.toFixed(1) + ' yrs'),
}
