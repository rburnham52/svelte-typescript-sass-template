const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/**
    merge.smart replaces matches
    You can debug the output using
        console.dir(config, { depth: null });
    ref: https://github.com/survivejs/webpack-merge
*/
let config = merge.smart(common, {
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.svelte$/,
                use: {
                    loader: 'svelte-loader',
                    options: {
                        emitCss: true,
                        hotReload: false,
                        preprocess: require('svelte-preprocess')({ /* options */})
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    /**
                     * MiniCssExtractPlugin doesn't support HMR.
                     * For developing, use 'style-loader' instead.
                     * */
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                ]
            }
        ]
    },
});
//console.dir(config, { depth: null });
module.exports = config;
