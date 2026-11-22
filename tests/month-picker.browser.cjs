const assert = require('node:assert/strict')
const path = require('node:path')
const { chromium } = require(process.env.RSA_BROWSER_PLAYWRIGHT || '/tmp/rsapharma-browser-tools/node_modules/playwright')

const vuePath = process.env.RSA_MONTHLY_VUE || path.join(path.dirname(require.resolve('vue')), 'dist/vue.global.js')
const momentPath = process.env.RSA_MONTHLY_MOMENT || require.resolve('moment/min/moment.min.js')
const pickerPath = process.env.RSA_MONTHLY_PICKER_BUNDLE || path.resolve(__dirname, '../dist/lib/vue-monthly-picker.min.js')
const chromiumPath = process.env.RSA_BROWSER_CHROMIUM || '/home/sanketsharma/.cache/ms-playwright/chromium-1234/chrome-linux/chrome'

async function main() {
    const browser = await chromium.launch({ executablePath: chromiumPath, headless: true })

    try {
        const page = await browser.newPage()
        page.setDefaultTimeout(3000)
        const errors = []
        page.on('pageerror', error => errors.push(error.message))
        await page.setContent('<div id="app"></div>')
        await page.addScriptTag({ path: vuePath })
        await page.addScriptTag({ path: momentPath })
        await page.addScriptTag({ path: pickerPath })
        await page.evaluate(() => {
            window.selectedEvents = []
            const library = window.VueMonthlyPicker || window['vue-monthly-picker']
            const picker = library.default || library
            const component = {
                data: () => ({
                    selectedMonth: window.moment('2026-10-15'),
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    minimum: window.moment('2026-10-01'),
                    maximum: window.moment('2026-11-30'),
                }),
                methods: {
                    onSelected(value) {
                        window.selectedEvents.push(value ? value.format('YYYY-MM') : null)
                    },
                },
                template: '<vue-monthly-picker v-model="selectedMonth" :month-labels="labels" :min="minimum" :max="maximum" @selected="onSelected" />',
            }

            if (window.Vue.version.startsWith('2.')) {
                window.vm = new window.Vue({ ...component, el: '#app', components: { 'vue-monthly-picker': picker } })
            } else {
                const app = window.Vue.createApp(component)
                app.component('vue-monthly-picker', picker)
                window.vm = app.mount('#app')
            }
        })

        assert.equal(await page.locator('.month-year-display').innerText(), '2026/10')
        await page.locator('.month-year-label').click()
        await page.locator('.item.active').filter({ hasText: 'Nov' }).click()
        assert.equal(await page.locator('.month-year-display').innerText(), '2026/11')
        assert.deepEqual(await page.evaluate(() => window.selectedEvents), ['2026-11'])
        assert.equal(await page.evaluate(() => window.vm.selectedMonth.format('YYYY-MM')), '2026-11')

        await page.locator('.month-year-label').click()
        assert.equal(await page.locator('.item.deactive').filter({ hasText: 'Dec' }).count(), 1)

        await page.locator('.month-year-label').hover()
        assert.equal(await page.locator('.vmp-input-append').evaluate(element => getComputedStyle(element).display), 'block')
        await page.locator('.vmp-input-append').click()
        assert.equal(await page.locator('.month-year-display').innerText(), '')
        assert.deepEqual(await page.evaluate(() => window.selectedEvents), ['2026-11', null])
        assert.deepEqual(errors, [])
        console.log('PASS: month picker displays the selected month, enforces limits, emits selection and clears')
    } finally {
        await browser.close()
    }
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
