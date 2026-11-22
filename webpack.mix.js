const path = require('path')
const mix = require('laravel-mix')

mix.setPublicPath('dist')
    .js('src/lib.js', 'lib/vue-monthly-picker.min.js')
    .vue({ version: 3 })
    .webpackConfig({
        externals: {
            vue: { commonjs: 'vue', commonjs2: 'vue', amd: 'vue', root: 'Vue' },
            moment: { commonjs: 'moment', commonjs2: 'moment', amd: 'moment', root: 'moment' },
        },
        output: {
            library: 'VueMonthlyPicker',
            libraryTarget: 'umd',
            globalObject: 'this',
        },
        resolve: {
            modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
        },
    })
