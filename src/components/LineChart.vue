<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, Tooltip, Legend, Filler } from 'chart.js'
import { theme } from '../lib/theme'

Chart.register(LineController, LineElement, PointElement, LinearScale, Tooltip, Legend, Filler)

const props = defineProps({
  series: { type: Array, required: true }, // [{label, color, points:[{x,y}], dashed, hideLegend}]
  yFormat: { type: Function, default: (v) => v },
  height: { type: Number, default: 320 },
})

const canvas = ref(null)
let chart

function css(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function build() {
  chart?.destroy()
  const text2 = css('--text-2'), border = css('--border'), surface = css('--surface')
  chart = new Chart(canvas.value, {
    type: 'line',
    data: {
      datasets: props.series.map((s) => ({
        label: s.label,
        data: s.points,
        borderColor: css(s.color) || s.color,
        backgroundColor: css(s.color) || s.color,
        borderWidth: 2,
        borderDash: s.dashed ? [5, 4] : [],
        pointRadius: s.dashed ? 0 : 3.5,
        pointHoverRadius: 6,
        pointBorderColor: surface,
        pointBorderWidth: 2,
        spanGaps: true,
        tension: 0,
        hideLegend: s.hideLegend,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 250 },
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { type: 'linear', ticks: { stepSize: 1, color: text2, callback: (v) => String(v) }, grid: { display: false }, border: { color: border } },
        y: { ticks: { color: text2, callback: props.yFormat }, grid: { color: border }, border: { display: false } },
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: text2, usePointStyle: true, pointStyle: 'rectRounded', boxWidth: 10, boxHeight: 10, filter: (item, data) => !data.datasets[item.datasetIndex].hideLegend },
        },
        tooltip: {
          backgroundColor: css('--surface'),
          titleColor: css('--text'),
          bodyColor: css('--text-2'),
          borderColor: border,
          borderWidth: 1,
          padding: 10,
          usePointStyle: true,
          callbacks: {
            title: (items) => String(items[0]?.parsed.x ?? ''),
            label: (c) => ` ${c.dataset.label}: ${props.yFormat(c.parsed.y)}`,
          },
        },
      },
    },
  })
}

onMounted(build)
watch(() => props.series, build, { deep: true })
watch(theme, () => requestAnimationFrame(build))
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <div :style="{ position: 'relative', height: height + 'px' }">
    <canvas ref="canvas" role="img" aria-label="Line chart"></canvas>
  </div>
</template>
