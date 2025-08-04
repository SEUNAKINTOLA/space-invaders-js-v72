/**
 * Webpack Configuration
 * 
 * This configuration file sets up webpack for both development and production environments.
 * It includes optimizations, loaders, and plugins for modern web development.
 * 
 * @author [Your Name]
 * @version 1.0.0
 */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

/**
 * Determines if the current environment is production
 * @type {boolean}
 */
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Base webpack configuration object
 * @type {import('webpack').Configuration}
 */
const config = {
  // Set the mode based on environment
  mode: isProduction ? 'production' : 'development',

  // Entry point of the application
  entry: {
    main: path.resolve(__dirname, 'src/index.js'),
  },

  // Output configuration
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isProduction ? '[name].[contenthash].js' : '[name].bundle.js',
    clean: true,
    publicPath: '/',
  },

  // Module rules for different file types
  module: {
    rules: [
      // JavaScript/JSX processing
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      // CSS processing
      {
        test: /\.css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
      // Asset processing
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[hash][ext][query]',
        },
      },
      // Font processing
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[hash][ext][query]',
        },
      },
    ],
  },

  // Resolution configuration
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  // Plugins configuration
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      favicon: path.resolve(__dirname, 'src/favicon.ico'),
      inject: true,
    }),
    new ESLintPlugin({
      extensions: ['js', 'jsx'],
      fix: true,
    }),
  ],

  // Development server configuration
  devServer: {
    historyApiFallback: true,
    open: true,
    compress: true,
    hot: true,
    port: 3000,
    static: {
      directory: path.join(__dirname, 'public'),
    },
  },
};

/**
 * Production-specific configuration
 */
if (isProduction) {
  config.plugins.push(
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash].css',
    })
  );

  config.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      name: false,
    },
  };

  // Additional production-specific settings
  config.performance = {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  };
} else {
  // Development-specific configuration
  config.devtool = 'eval-source-map';
}

/**
 * Error handling for webpack configuration
 */
try {
  // Validate essential paths
  const requiredPaths = [
    path.resolve(__dirname, 'src/index.js'),
    path.resolve(__dirname, 'src/index.html'),
  ];

  requiredPaths.forEach(pathToCheck => {
    if (!require('fs').existsSync(pathToCheck)) {
      throw new Error(`Required file not found: ${pathToCheck}`);
    }
  });
} catch (error) {
  console.error('Webpack configuration error:', error);
  process.exit(1);
}

module.exports = config;