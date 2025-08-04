/**
 * Webpack Configuration
 * 
 * This configuration file sets up webpack for both development and production environments.
 * It includes advanced optimizations, code splitting, and performance enhancements.
 * 
 * @author [Your Name]
 * @version 1.1.0
 */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

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
  mode: isProduction ? 'production' : 'development',

  // Enhanced entry points for better code splitting
  entry: {
    main: path.resolve(__dirname, 'src/index.js'),
    // Separate vendor chunks
    vendor: ['react', 'react-dom', 'redux'],
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isProduction ? 'js/[name].[contenthash:8].js' : '[name].bundle.js',
    chunkFilename: isProduction ? 'js/[name].[contenthash:8].chunk.js' : '[name].chunk.js',
    clean: true,
    publicPath: '/',
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            // Add caching for babel
            cacheDirectory: true,
            cacheCompression: false,
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                auto: true,
                localIdentName: isProduction
                  ? '[hash:base64]'
                  : '[local]--[hash:base64:5]',
              },
            },
          },
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            // Inline images smaller than 4kb
            maxSize: 4 * 1024,
          },
        },
        generator: {
          filename: 'assets/images/[hash:8][ext][query]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[hash:8][ext][query]',
        },
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    // Optimize module resolution
    modules: ['node_modules'],
    symlinks: false,
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      favicon: path.resolve(__dirname, 'src/favicon.ico'),
      inject: true,
      // Optimize HTML in production
      minify: isProduction ? {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      } : false,
    }),
    new ESLintPlugin({
      extensions: ['js', 'jsx'],
      fix: true,
      cache: true,
    }),
  ],

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

  // Enhanced cache configuration
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
};

/**
 * Production-specific configuration with enhanced optimizations
 */
if (isProduction) {
  config.plugins.push(
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash:8].css',
      chunkFilename: 'styles/[name].[contenthash:8].chunk.css',
    }),
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8,
    })
  );

  config.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log'],
          },
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: 'single',
  };

  config.performance = {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  };
} else {
  config.devtool = 'eval-source-map';
}

/**
 * Error handling for webpack configuration
 */
try {
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