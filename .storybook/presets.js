module.exports = [
    "@storybook/preset-typescript",
    {
        name: '@storybook/preset-scss',
        options: {
            cssLoaderOptions: {
                sourceMap: true
            }
        }
    }];
