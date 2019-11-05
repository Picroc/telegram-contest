const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
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
<<<<<<< HEAD
                test: /\.(woff(2)?|ttf|eot|svg|png|jpe?g|gif|otf)(\?v=\d+\.\d+\.\d+)?$/,
=======
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg|otf)(\?v=\d+\.\d+\.\d+)?$/,
>>>>>>> 0e754bf8af81622b40ed9587e0f749aa911b5443
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
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-proposal-class-properties']
                    }
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
            chunks: ['index'],
            template: path.join(__dirname, '/public/index.html'),
            inject: true
        })
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