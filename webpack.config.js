const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const WebpackCopyPlugin = require('copy-webpack-plugin');
const merge = require('webpack-merge');


const common = {
    entry: {
        index: path.join(__dirname, 'src') + '/App.js',
        anim: path.join(__dirname, 'src') + '/utils/anim-monkey.js'
    },
    devtool: 'source-map',
    output: {
        filename: '[name].bundle.js',
        path: path.join(__dirname, 'build')
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
        },
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
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
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
                    filepath: require.resolve("./src/utils/telegramApi.min.js"),
                }
            ]
        )
    ]
}

const devServer = {
    // devServer: {
    //     stats: 'errors-only'
    // }
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