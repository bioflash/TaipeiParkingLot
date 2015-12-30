var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var googleApiKey = require('./googleApiKey').prod
module.exports = {
    /*devtool: 'source-map',*/
    entry:[
        './client/index.js'
    ],
    output:{
        path: path.join(__dirname,'client'),
        filename: '[name].bundle.js'
    },
    module: {
        loaders:[
            {
                test:/\.js$/,
                loaders:['babel'],
                exclude: /node_module/
            },
            {
                test:/\.css$/,
                loaders:['style','raw'],
                exclude: /node_module/
            },{
                test: /\.(png|gif|jpg|jpeg)$/,
                loaders:['file'],
                exclude: /node_module/
            }
        ]
    },
    plugins:[
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.join(__dirname, 'client', 'index.template.html'),
            inject:'body'
        }),
        new webpack.DefinePlugin({
            GOOGLE_API_KEY: JSON.stringify(googleApiKey)
        })
    ]
}