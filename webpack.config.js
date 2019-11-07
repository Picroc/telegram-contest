const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const merge = require('webpack-merge');



const common = {
    entry: {
        index: path.join(__dirname, 'src') + '/App.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.join(__dirname, 'build')
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg|png|jpe?g|gif|otf)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'static/'
                        }
                    }
                ]
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                }
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                use: { loader: 'html-loader' }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.join(__dirname, '/public/index.html'),
            inject: true
        }),
        new AddAssetHtmlPlugin(
            [
                {
                    filepath: require.resolve("./node_modules/telegram-api-js/dist/telegramApi.min.js"),
                }
            ]
        ),
    ]
}

const devServer = {
    devServer: {
        stats: 'errors-only'
    }
}

module.exports = env => {
    if (env === 'production') {
        return common;
    }
    if (env === 'development') {
        return merge([
            common,
            devServer
        ])
    }
}