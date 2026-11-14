<script setup>
import { computed, watch } from 'vue'
import { UNIVERSITIES, UNI_SHORT, programmes } from '../lib/calc'
import { selection } from '../lib/state'

const list = computed(() => programmes(selection.uni))
watch(list, (l) => {
  if (!l.includes(selection.degree)) selection.degree = l[0]
}, { immediate: true })
</script>

<template>
  <label class="field">
    <span>University</span>
    <div class="seg" role="radiogroup">
      <button v-for="(u, i) in UNIVERSITIES" :key="u" :class="{ on: selection.uni === i }" :title="u" @click="selection.uni = i">{{ UNI_SHORT[i] }}</button>
    </div>
  </label>
  <label class="field">
    <span>Programme</span>
    <select v-model="selection.degree">
      <option v-for="p in list" :key="p" :value="p">{{ p }}</option>
    </select>
  </label>
</template>
