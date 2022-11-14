const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
/**
 * Used for building the application for production, should be easily callable for the CI/CD
 */
module.exports = {
  mode: 'production',
  entry: './src/index.tsx',
  // Tells webpack where to bundle the code (build/*)
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].[contenthash].js',
    publicPath: '',
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/i,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  // Limit size of the bundled resource, webpack will warn if this is exceeded
  performance: {
    maxAssetSize: 512000,
    maxEntrypointSize: 512000,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    // Allows our tsconfig aliases to work with webpack
    plugins: [new TsconfigPathsPlugin()],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
    }),
    new ForkTsCheckerWebpackPlugin({
      async: false,
    }),
    new ESLintPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx'],
    }),
    // Plugin empties the build folder at start of the every new bundle
    new CleanWebpackPlugin(),
  ],
};
