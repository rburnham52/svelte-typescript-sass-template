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


module.exports = { scssAliases, aliases, onwarn };
