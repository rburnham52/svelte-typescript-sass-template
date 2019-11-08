const merge = require('webpack-merge');
const {CheckerPlugin} = require('awesome-typescript-loader');
const path = require('path');


module.exports = ({config, mode}) => {
    // console.dir(config, { depth: null });
    let mergedConfig = merge.smart(config, {
        module:
            {
                rules: [
                    {
                        test: /\.(svelte|html)$/,
                        loader: 'svelte-loader',
                        options: {
                            preprocess: require('svelte-preprocess')({ /* options */})
                        }
                    },
                ]
            },
    });
    mergedConfig.resolve.alias['@styles'] = path.resolve(__dirname, '../src/styles/');
    mergedConfig.plugins.push(new CheckerPlugin());
    //console.dir(mergedConfig, {depth: null});
    return mergedConfig;
};
