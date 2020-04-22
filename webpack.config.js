const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const HtmlMinifierPlugin = require('html-minifier-webpack-plugin');
const cssnano = require('cssnano');
const CopyPlugin = require('copy-webpack-plugin');


const currentMode = process.env.NODE_ENV || 'development';
const isDev = currentMode === 'development';


module.exports = {
  mode: currentMode,
  devtool: isDev ? 'source-map' : '',
  entry: {
    main: './src/index.js',
    sw: './src/sw.js',
  },
  output: {
    filename: '[name].js',
    path: `${__dirname}/dist`,
  },
  optimization: {
    minimizer: [
      new TerserJSPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessor: cssnano,
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }],
        },
      }),
      new HtmlMinifierPlugin({ collapseWhitespace: true }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'template.html',
    }),
    new MiniCssExtractPlugin(),
    new CopyPlugin([
      { from: 'src/icons', to: 'icons' },
      { from: 'src/manifest.json' },
    ]),
  ],
};
