const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CheckerPlugin } = require('awesome-typescript-loader');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');

module.exports = {
	entry: {
		bundle: ['./src/main.ts']
	},
	resolve: {
		alias: {
			svelte: path.resolve('node_modules', 'svelte'),
			'@styles': path.resolve(__dirname, 'src/styles/'),
		},
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
				use: [{ loader: require.resolve('awesome-typescript-loader') }],
			},
			{
				test: /\.svelte$/,
				use: {
					loader: 'svelte-loader',
					options: {
						emitCss: true,
						hotReload: true,
						preprocess: require('svelte-preprocess')({ /* options */ })
					}
				}
			}
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
            { from: 'public'}
        ])
	]
};
