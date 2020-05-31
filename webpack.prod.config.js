const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const HtmlMinifierPlugin = require('html-minifier-webpack-plugin');
const cssnano = require('cssnano');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');


// const currentMode = process.env.NODE_ENV || 'development';
// const isDev = currentMode === 'development';


module.exports = {
  mode: 'production',
  entry: {
    main: './src/app/index_prod.js',
    sw: './src/app/sw.js',
  },
  output: {
    filename: '[name].js',
    path: `${__dirname}/dist`,
    publicPath: '/',
  },
  optimization: {
    // minimize: false,
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
      meta: { viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no' },
      minify: false, // item optimization do minimization
    }),
    new FaviconsWebpackPlugin({
      logo: './src/app/icons/icon.png',
      cache: true,
      mode: 'webapp',
      prefix: 'icons/',
      favicons: {
        appName: 'Warm-floor',
        appShortName: 'WF',
        appDescription: 'Warm-floor controller app',
        background: '#ffffff',
        theme_color: '#ffffff',
        display: 'minimal-ui',
        icons: {
          android: true,
          appleIcon: true,
          appleStartup: true,
          coast: true,
          favicons: true,
          firefox: true,
          windows: true,
          yandex: true,
        },
      },
    }),
    new MiniCssExtractPlugin(),
  ],
};
