var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var googleApiKey = require('./googleApiKey').dev
module.exports = {
    devtool: 'source-map',
    entry: [
        './client/index.js'
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].[hash].bundle.js',
        publicPath: 'http://localhost:8080/'
    },
    plugins:[
        /*HtmlWebpackPlugin is used to trigger re-build while modifying html file*/
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.join(__dirname, 'client', 'index.template.html'),
            inject:'body'
        }),
        new webpack.DefinePlugin({
            GOOGLE_API_KEY: JSON.stringify(googleApiKey)
        })
    ],
    module:{
        loaders:[{
            test: /\.js$/,
            loaders: ['babel'],
            exclude: /node_modules/,
            include: __dirname
        },{
            test:/\.css$/,
            loaders:['style', 'raw'],
            include:__dirname
        },{
            test:/\.(png|gif|jpg|jpeg)$/,
            excluse:/node_modules/,
            loaders:['file']
        }]
    },
    devServer:{
        contentBase: path.join(__dirname, '/client'), /* This allow webpack-dev-server to set static source using express.static middleware */
        inline:true /* same effect as invoking webpack-dev-server --inline*/,
        proxy:{
            '/api*':{
                target: 'http://localhost:3000'
            }
        }
    }
}