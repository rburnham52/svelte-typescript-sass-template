const path = require('path');


/**
 *  Disables some sass warnings that are not really warnings
 */
const onwarn = (warning, onwarn) => warning.code === 'css-unused-selector' || onwarn(warning);

/**
 * Custom Sass Importer to enable the use of aliases in sass.
 * This will fall back to node_modules if the path starts with ~ and can not be matched to an alias
 */
const scssAliases = aliases => {
    return url => {
        // console.log('attempting to resolve: '+  url);
        // sass-loader normally requires you to add a ~ character to the start of your aliases
        if (url.startsWith("~")) {
            // we want to remove the ~ character before comparing the url to an alias
            this.url = url.slice(1);
            for (const [alias, aliasPath] of Object.entries(aliases)) {
                if (this.url.indexOf(alias) === 0) {
                    const filePath = path.resolve(this.url.replace(alias, aliasPath));
                    // console.log('found alias: '+  alias + '; at ' + filePath);
                    return {
                        file: filePath,
                    };
                }
            }
            //If there was nothing found fall back to node_modules
            const filePath = path.resolve(process.cwd(), "node_modules", this.url);
            // console.log('Attempting to resolve', filePath);
            //if we can't find anything fall back to node_modules
            return {
                file: filePath
            };
        }
        // console.log('could not match: ' + url);
        //if there is no match return null to allow other importers a chance to resolve.
        return null;
    };
};

/**
 * Aliases used during import, shared between webpack and sass-loader
 */
const aliases = {
    //TODO: Look at a way to share tsconfig.json paths and these aliases
    svelte: path.resolve('node_modules', 'svelte'),
    '@src': path.resolve(__dirname, 'src/'),
    '@styles': path.resolve(__dirname, 'src/styles/'),
    '@common': path.resolve(__dirname, 'src/common/'),
};


/**
 * Returns webpack resolve object
 * https://webpack.js.org/configuration/resolve/
 */
exports.loadResolver = () => ({
    // resolve.alias
    // Create aliases to import or require certain modules more easily. For example, to alias a bunch of commonly used src/ folders:
    //
    // alias: {
    //   Utilities: path.resolve(__dirname, 'src/utilities/'),
    //   Templates: path.resolve(__dirname, 'src/templates/')
    // }
    // Now, instead of using relative paths when importing like so:
    //
    // import Utility from '../../utilities/utility';
    // you can use the alias:
    //
    // import Utility from 'Utilities/utility';
    // https://webpack.js.org/configuration/resolve/
    resolve: {
        alias: aliases,
        extensions: ['.mjs', '.ts', '.tsx', '.js', '.svelte', 'scss', 'css'],
        mainFields: ['svelte', 'browser', 'module', 'main'],
        modules: [path.resolve(__dirname, 'src'), 'node_modules']
    },
});

// The first step towards configuring Babel to work with webpack is to set up babel-loader. It takes the code and turns it into a format older browsers can understand. Install babel-loader and include its peer dependency babel-core:
// exports.loadSvelte = ({ include, exclude } = {}) => ({
//     module: {
//         rules: [
//             {
//                 test: /\.(js|jsx)$/,
//                 include,
//                 exclude,
//                 use: 'babel-loader'
//             }
//         ]
//     }
// });

const magicImporter = require('node-sass-magic-importer');
/**
 * Loads the rules and preprocessor for processing svelte files.
 * This also supports Sass and Typescript within .svelte files
 */
exports.loadSvelte = ({ mode } = {}) => ({
    module: {
        rules: [
            {
                // test: /\.svelte$/,
                test: /\.(svelte|html)$/,
                use: {
                    loader: 'svelte-loader',
                    options: {
                        emitCss: true,
                        hotReload: mode !== 'production',
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
            }
        ]
    }
});


const {CheckerPlugin} = require('awesome-typescript-loader');
/**
 * Loads Typescript rules and Plugins
 */
exports.loadTypeScript = ({ mode } = {}) => ({
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: [{loader: require.resolve('awesome-typescript-loader')}],
            }
        ]
    },
    plugins: [
        new CheckerPlugin()
    ]
});

const HtmlWebPackPlugin = require('html-webpack-plugin');
/**
 * Loads the html-webpack-plugin and html-loader required to dynamically generate the index file and inject bundles.
 */
exports.loadHtml = ({ include, exclude, mode } = {}) => ({
    module: {
        rules: [
            {
                test: /\.html$/,
                include,
                exclude,
                use: [
                    {
                        loader: 'html-loader',
                        options: { minimize: mode === 'production' }
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: './src/index.html',
            filename: './index.html'
        })
    ]
});

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
/**
 * Loads the rules and plugins for required for the css pipeline
 * loaders: sass-loader, css-loader, MiniCssExtractPlugin
 */
exports.loadStyles = ({ include, exclude, mode } = {}) => ({
    module: {
        rules: [
            {
                test: /\.(scss|sass|css)$/,
                include,
                exclude,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: mode !== 'production',
                        },
                    },
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true
                        }
                    },
                    // 'postcss-loader',
                    'sass-loader',
                ],
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: mode !== 'production' ? '[name].css' : '[name].[hash].css',
            chunkFilename: mode !== 'production' ? '[name].css' : '[name].[hash].css',
        }),
    ]
});

const CopyPlugin = require('copy-webpack-plugin');
/**
 * Loads rules required for static files
 */
exports.loadStaticFiles = ({ mode } = {}) => ({
    module: {
        rules: [
            {
                test: /\.(svg|ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/,
                loader: 'file-loader',
            },
        ]
    },
    plugins: [
        new CopyPlugin([
            {from: 'public'},
            {
                context: 'node_modules/@webcomponents/webcomponentsjs',
                from: '**/*.js',
                to: 'webcomponents'
            }
        ])
    ]
});

/**
 * Loads webpack bundle optimisation settings.
 */
exports.loadOptimizations = () => ({
    optimization: {
        runtimeChunk: false,
        namedChunks: true,
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendors: {
                    name: 'vendor',
                    // async + async chunks
                    chunks: 'all',
                    test: /node_modules/,
                    priority: 20
                },
                styles: {
                    test: /\.s?css/,
                    chunks: "all",
                    name: 'styles',
                    priority: 30
                },
                common: {
                    name: 'common',
                    minChunks: 2,
                    chunks: 'all',
                    priority: 10,
                    reuseExistingChunk: true,
                    enforce: true
                },
            }
        },
    }
});


/**
 * Loads the webpack dev server settings
 */
exports.devServer = ({ host, port } = {}) => ({
    devServer: {
        stats: 'errors-only',
        contentBase: './build',
        port: 4000,
        open: true,
        // Shows a full-screen overlay in the browser when there are compiler errors or warnings. If you want to show only compiler errors:
        overlay: true
    }
});

// // webpack doesn’t know to extract CSS to a file.
// //
// // In the past it was a job for extract-text-webpack-plugin.
// //
// // Unfortunately said plugin does not play well with webpack 4.
// //
// // According to Michael Ciniawsky:
// //
// // extract-text-webpack-plugin reached a point where maintaining it become too much of a burden and it’s not the first time upgrading a major webpack version was complicated and cumbersome due to issues with it
// //
// // mini-css-extract-plugin is here to overcome those issues.
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//
// // This is the version with MiniCssExtractPlugin
// exports.loadProdCss = ({ include, exclude } = {}) => ({
//     module: {
//         rules: [
//             {
//                 test: /\.(css|scss)$/,
//                 include,
//                 exclude,
//                 use: [
//                     'style-loader',
//                     MiniCssExtractPlugin.loader,
//                     {
//                         loader: 'css-loader',
//                         options: {
//                             minimize: true
//                         }
//                     },
//                     'sass-loader'
//                 ]
//             }
//         ]
//     },
//     plugins: [
//         new MiniCssExtractPlugin({
//             filename: '[name].css',
//             chunkFilename: '[id].css'
//         })
//     ]
// });

// exports.loadDevCss = ({ include, exclude, options } = {}) => ({
//     module: {
//         rules: [
//             {
//                 test: /\.scss$/,
//                 include,
//                 exclude,
//                 use: [
//                     'style-loader',
//                     {
//                         loader: 'css-loader',
//                         options
//                     },
//                     'sass-loader'
//                 ]
//             }
//         ]
//     }
// });

// Frameworks like Bootstrap tend to come with a lot of CSS. Often you use only a small part of it. Typically, you bundle even the unused CSS. It's possible, however, to eliminate the portions you aren't using.
//
// PurifyCSS is a tool that can achieve this by analyzing files. It walks through your code and figures out which CSS classes are being used. Often there is enough information for it to strip unused CSS from your project. It also works with single page applications to an extent.
// const PurifyCSSPlugin = require('purifycss-webpack');
//
// exports.purifyCSS = ({ paths }) => ({
//     plugins: [new PurifyCSSPlugin({ paths })]
// });

/**
 * Uses url-loader to load images
 * url-loader is a good starting point and it's the perfect option for development purposes, as you don't have to care about the size of the resulting bundle.
 * It comes with a limit option that can be used to defer image generation to file-loader after an absolute limit is reached.
 * This way you can inline small files to your JavaScript bundles while generating separate files for the bigger ones.
 */
exports.loadImages = ({ include, exclude, options } = {}) => ({
    module: {
        rules: [
            {
                test: /\.(png|jpg|jpeg|gif|eot|ttf|woff2)$/,
                include,
                exclude,
                use: {
                    loader: 'url-loader',
                    options
                }
            }
        ]
    }
});


/**
 * Uses file-loader to load ico files
 */
exports.loadIcos = ({ include, exclude } = {}) => ({
    module: {
        rules: [
            {
                test: /\.ico$/,
                include,
                exclude,
                use: {
                    loader: 'file-loader?name=[name].[ext]'
                }
            }
        ]
    }
});

/**
 * Enables loading of markdown files
 */
exports.loadMds = ({ include, exclude } = {}) => ({
    module: {
        rules: [
            {
                test: /\.md$/,
                include,
                exclude,
                use: 'raw-loader'
            }
        ]
    }
});

/**
 * Loads svg files.
 */
exports.loadSvgs = ({ include, exclude } = {}) => ({
    module: {
        rules: [
            {
              test: /\.svg$/,
              use: "file-loader",
            }
        ]
    }
});

/**
 * Enables source map generation in webpack
 * @returns {{devtool: string}}
 */
exports.generateSourceMaps = () => ({
    devtool: 'source-map'
});


const CleanWebpackPlugin = require('clean-webpack-plugin');
/**
 * Cleans the build directory
 */
exports.clean = path => ({
    plugins: [new CleanWebpackPlugin([path])]
});

// // This plugin uses UglifyJS v3 (uglify-es) to minify your JavaScript
// const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin');
// exports.minifyJavaScript = () => ({
//     optimization: {
//         minimizer: [new UglifyWebpackPlugin({ sourceMap: true, extractComments: true })]
//     }
// });

// // Minifying CSS
// // css-loader allows minifying CSS through cssnano. Minification needs to be enabled explicitly using the minimize option. You can also pass cssnano specific options to the query to customize the behavior further.
// //
// // clean-css-loader allows you to use a popular CSS minifier clean-css.
// //
// // optimize-css-assets-webpack-plugin is a plugin based option that applies a chosen minifier on CSS assets. Using ExtractTextPlugin can lead to duplicated CSS given it only merges text chunks. OptimizeCSSAssetsPlugin avoids this problem by operating on the generated result and thus can lead to a better result.
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// const cssnano = require('cssnano');
// exports.minifyCSS = ({ options }) => ({
//     plugins: [
//         new OptimizeCSSAssetsPlugin({
//             cssProcessor: cssnano,
//             cssProcessorOptions: options,
//             canPrint: false
//         })
//     ]
// });

// // Setting process.env.NODE_ENV
// // As before, encapsulate this idea to a function. Due to the way webpack replaces the free variable, you should push it through JSON.stringify. You end up with a string like '"demo"' and then webpack inserts that into the slots it finds:
// const webpack = require('webpack');
//
// exports.setFreeVariable = (key, value) => {
//     const env = {};
//     env[key] = JSON.stringify(value);
//
//     return {
//         plugins: [new webpack.DefinePlugin(env)]
//     };
// };

/**
 * Sets a Webpack Environment Variable Best approach to pass Environment Variables
 */
exports.setEnvVariables = obj => {
    return {
        plugins: [new webpack.DefinePlugin(obj)]
    };
};

// // Use the NoEmitOnErrorsPlugin to skip the emitting phase whenever there are errors while compiling. This ensures that no assets are emitted that include errors. The emitted flag in the stats is false for all assets.
// exports.setNoErrors = () => {
//     return new webpack.NoEmitOnErrorsPlugin();
// };

// // Prepare compressed versions of assets to serve them with Content-Encoding
// const CompressionPlugin = require('compression-webpack-plugin');
// exports.setCompression = () => {
//     return {
//         plugins: [new CompressionPlugin()]
//     };
// };


/**
 * Enables the BundleAnalyzerPlugin
 * This module will help you:
 *
 * Realize what's really inside your bundle
 * Find out what modules make up the most of its size
 * Find modules that got there by mistake
 * Optimize it!
 * And the best thing is it supports minified bundles! It parses them to get real size of bundled modules. And it also shows their gzipped sizes!
 */
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
exports.setAnalyzer = () => {
    return {
        plugins: [new BundleAnalyzerPlugin()]
    };
};

// // This plugin will cause hashes to be based on the relative path of the module, generating a four character string as the module id. Suggested for use in production.
// exports.setHashModuleIds = () => {
//     return {
//         plugins: [new webpack.HashedModuleIdsPlugin({
//             hashFunction: 'sha256',
//             hashDigest: 'hex',
//             hashDigestLength: 20
//         })]
//     };
// };
