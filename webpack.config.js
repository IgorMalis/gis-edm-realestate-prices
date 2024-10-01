const resolve = require('path').resolve;
const webpack = require('webpack');
const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = function (webpackEnv) {
  return {
    mode: 'development',

    entry: {
      app: resolve('./app.js')
    },

    output: {
      library: 'App',
    },

    module: {
      rules: [
        {
          // Compile ES2015+ using buble
          test: /\.js$/,
          loader: 'buble-loader',
          include: [resolve('.')],
          exclude: [/node_modules/],
          options: {
            objectAssign: 'Object.assign'
          }
        },
        {
          test: /\.(css|scss)$/,
          use: [
            "style-loader", 
            "css-loader"
          ]
        },
        {
          test: /\.(png|jpg|csv)$/,
          use: [{
              loader: 'file-loader',
              options: {}
          }]
        },
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname,'src','index.html'),
        filename: 'index.html',
        inject: false
      }),
      new Dotenv(),
    ]
  }
};
