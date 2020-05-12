const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, options) => {
  const isProd = options.mode === 'production';
  const config = {
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? 'none' : 'source-map',
    entry: './src/index.js',
    output: {
      filename: 'script.js',
      path: path.resolve(__dirname, 'dist')
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    },
    plugins: [
      new CopyWebpackPlugin([
        { from: `src/styles`, to: `styles` },
        { from: `src/index.html`, to: `index.html` },
        { from: `src/assets`, to: `assets` },
        { from: `src/ext-utils`, to: `ext-utils` }
      ]),
    ],
  };

  return config;
}