<script setup>
import { computed } from 'vue'

const props = defineProps({
  corner: String,
  cols: Array, // [{key,label}]
  rows: Array, // [{key,label}]
  values: Array, // values[r][c] (number | null)
  format: Function,
  lowerIsBetter: { type: Boolean, default: true },
  selected: Object, // {row, col}
  nullLabel: { type: String, default: 'Never' },
})

const range = computed(() => {
  const all = props.values.flat().filter((v) => v != null && isFinite(v))
  return { min: Math.min(...all), max: Math.max(...all) }
})

function t(v) {
  if (v == null) return 1
  const { min, max } = range.value
  if (max === min) return 0.5
  const x = (v - min) / (max - min)
  return props.lowerIsBetter ? x : 1 - x
}
function style(v) {
  // single-hue sequential: darker = worse for the student
  const p = Math.round(8 + t(v) * 80)
  return {
    background: v == null ? 'var(--bad-bg)' : `color-mix(in oklab, var(--heat-1) ${p}%, var(--heat-0))`,
    color: v == null ? 'var(--bad)' : p > 50 ? '#fff' : 'var(--text)',
  }
}
</script>

<template>
  <div class="table-wrap">
    <table class="heat">
      <thead>
        <tr>
          <th style="text-align: left">{{ corner }}</th>
          <th v-for="c in cols" :key="c.key">{{ c.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, ri) in rows" :key="r.key">
          <th style="text-align: left; font-weight: 500">{{ r.label }}</th>
          <td
            v-for="(c, ci) in cols"
            :key="c.key"
            class="cell"
            :class="{ sel: selected && selected.row === r.key && selected.col === c.key }"
            :style="style(values[ri][ci])"
            :title="`${r.label} · ${c.label}: ${values[ri][ci] == null ? nullLabel : format(values[ri][ci])}`"
          >
            {{ values[ri][ci] == null ? nullLabel : format(values[ri][ci]) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
