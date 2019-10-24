const merge = require('webpack-merge');
const common = require('./webpack.common.js');
/**
 merge.smart replaces matches
 You can debug the output using
    console.dir(config, { depth: null });
 ref: https://github.com/survivejs/webpack-merge
 */
module.exports = merge.smart(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    /**
                     * MiniCssExtractPlugin doesn't support HMR.
                     * For developing, use 'style-loader' instead.
                     * */
                    'style-loader',
                    'css-loader',
                ]
            }
        ]
    },
    devServer: {
        contentBase: './build',
        port: 4000
    },
});
