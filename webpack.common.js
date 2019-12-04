const {aliases, scssAliases, onwarn} = require( "./webpack.parts");

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {CheckerPlugin} = require('awesome-typescript-loader');
const CopyPlugin = require('copy-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const path = require('path');
const magicImporter = require('node-sass-magic-importer');

module.exports = {
    entry: {
        bundle: ['./src/main.ts']
    },
    resolve: {
        alias: aliases,
        extensions: ['.mjs', '.ts', '.tsx', '.js', '.svelte', 'scss', 'css'],
        mainFields: ['svelte', 'browser', 'module', 'main'],
        modules: [path.resolve(__dirname, 'src'), 'node_modules']
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js',
        chunkFilename: '[name].[id].js'
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: [{loader: require.resolve('awesome-typescript-loader')}],
            },
            {
                test: /\.svelte$/,
                use: {
                    loader: 'svelte-loader',
                    options: {
                        emitCss: true,
                        hotReload: true,
                        onwarn: onwarn,
                        preprocess: require('svelte-preprocess')({
                            scss: {
                                importer: [
                                    scssAliases(aliases),
                                    //magicImporter()
                                ],
                            }
                        })
                    }
                }
            },
            {
                test:  /\.(svg|ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/,
                loader: 'file-loader',
            },
            /*Style rules are customised in separate dev/prod configs*/
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
        new CheckerPlugin(),
        new CopyPlugin([
            {from: 'public'}
        ])
    ]
};
