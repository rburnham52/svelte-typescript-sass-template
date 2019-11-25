const {aliases, scssAliases} = require("./webpack.parts");

const sveltePreprocess = require('svelte-preprocess');

module.exports = {
    preprocess: sveltePreprocess({
        scss: {
            importer: [
                scssAliases(aliases),
            ],
        }
    }),
};
