# @dukstra/vue-monthly-picker

A Vue 3 month and year picker. Its `v-model` value is a Moment object. The
component keeps the existing month labels, min/max limits, alignment, clear
button, and `selected` event behavior.

## Install

```sh
npm install @dukstra/vue-monthly-picker moment
```

Vue 3 and Moment are peer dependencies.

## Use

```vue
<template>
  <VueMonthlyPicker
    v-model="selectedMonth"
    :month-labels="monthLabels"
    :min="minimumMonth"
    :max="maximumMonth"
    @selected="onMonthSelected"
  />
</template>

<script setup>
import { ref } from 'vue'
import moment from 'moment'
import VueMonthlyPicker from '@dukstra/vue-monthly-picker'

const selectedMonth = ref(moment())
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const minimumMonth = moment('2026-01-01')
const maximumMonth = moment('2026-12-31')
const onMonthSelected = value => {
  // value is a Moment object, or null when cleared
}
</script>
```

For `v-model`, selection emits `update:modelValue` with the selected Moment
value. The `selected` event continues to emit the same value for existing
listeners. Clearing emits `null`.

## Build and test

```sh
npm ci
npm run build
npx playwright install chromium
npm run test:browser
```
