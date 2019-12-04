const {aliases, scssAliases} = require("./webpack.parts");
const magicImporter = require('node-sass-magic-importer');
const sveltePreprocess = require('svelte-preprocess');

module.exports = {
    preprocess: sveltePreprocess({
        scss: {
            importer: [
                //scssAliases(aliases),
                magicImporter()
            ],
        }
    }),
};
