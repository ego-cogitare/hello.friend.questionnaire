const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/app.jsx',
  output: {
    path: "public",
    filename: 'app.js'
  },
  devtool: null,
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
        loaders: ['style-loader', 'css-loader']
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
    new HtmlWebpackPlugin({
      inject: false,
      template: 'src/staticFiles/index.ejs',
    })
  ]
};
