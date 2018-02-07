const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');

module.exports = {
  entry: './src/app.jsx',
  devtool: null,
  output: {
    path: "./public",
    publicPath: "./",
    filename: 'questionnaire.min.js'
  },
  module: {
    loaders: [
      {
        test : /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader : 'babel-loader',
        query: {
          presets: ['react', 'es2015', 'stage-0'],
          plugins: [
            'transform-decorators-legacy',
            'transform-class-properties',
            'react-html-attrs'
          ]
        }
      },
      {
        test: /\.(css|scss)$/,
        loader: ExtractTextPlugin.extract('style', 'css')
      },
      {
        test: /\.(svg|png|jpg|jpeg|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader?name=images/[name].[ext]"
      },
      {
        test: /\.(woff|woff2|ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader?name=fonts/[name].[ext]"
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({ config: 'config' }),
    // new WebpackCleanupPlugin({
    //   exclude: ['vendors/**/*', 'icons/**/*'],
    // }),
    new HtmlWebpackPlugin({
      inject: false,
      template: 'src/staticFiles/index.ejs',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true
      }
    }),
    new ExtractTextPlugin("questionnaire.min.css"),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false })
  ]
};
