var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: ['./src/index.js'],
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
    },    
    output: {
        filename: 'main.js'
    },
    plugins: [new HtmlWebpackPlugin()]
};