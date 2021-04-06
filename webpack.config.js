const path = require("path");
const Dotenv = require("dotenv-webpack");
const BrotliPlugin = require("brotli-webpack-plugin");
const AssetsPlugin = require("assets-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const isProd = process.env.NODE_ENV === "production";
const outputDirectory = "dist";

/**
 * Plugins for dev environment
 */
const devPlugins = [
  new Dotenv({
    path: `./.env.${isProd ? "production" : "development"}`,
    safe: false,
    systemvars: true,
    silent: false,
    defaults: false,
  }),
  new CleanWebpackPlugin({
    cleanAfterEveryBuildPatterns: [outputDirectory],
  }),
  new HtmlWebpackPlugin({
    template: "./public/index.html",
    favicon: "./public/favicon.ico",
  }),
  new AssetsPlugin({
    prettyPrint: true,
    filename: "assets.json",
    removeFullPathAutoPrefix: true,
    path: path.resolve(__dirname, "dist"),
  }),
];

/**
 * Plugins for production environment
 */
const prodPlugins = [
  new BrotliPlugin({
    asset: "[path].br[query]",
    test: /\.(js|css|html|svg)$/,
    threshold: 10240,
    minRatio: 0.8,
  }),
];

/**
 * Merging plugins on the basis of env
 */
const pluginList = isProd ? [...devPlugins, ...prodPlugins] : devPlugins;

module.exports = {
  // May add cheap-module-source-map to devtool to generate source maps to prod builds
  devtool: isProd ? false : "inline-source-map",
  entry: ["babel-polyfill", "./src/client/index.js"],
  output: {
    path: path.join(__dirname, outputDirectory),
    filename: isProd ? "[name].[chunkhash].js" : "[name].bundle.js",
    // publicPath: 'build/client/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 100000,
            },
          },
        ],
      },
      {
        test: /\.(scss|css)$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  resolve: {
    extensions: ["*", ".js", ".jsx"],
  },
  devServer: {
    port: 3000,
    open: true,
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
  plugins: pluginList,
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
    runtimeChunk: {
      name: "manifest",
    },
  },
};
