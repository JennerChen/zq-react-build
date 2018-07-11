const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const eslintFormatter = require("react-dev-utils/eslintFormatter");
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
const paths = require("./paths");
const ManifestPlugin = require("webpack-manifest-plugin");
const getClientEnvironment = require("./env");

const publicPath = "/";

const env = getClientEnvironment("");

module.exports = {
  mode: "development",
  devtool: "eval-source-map",
  entry: [
    require.resolve("babel-polyfill"),
    require.resolve("./reactBuildHelper"),
    paths.appIndexJs
  ],
  output: {
    pathinfo: true,
    filename: "static/js/bundle.js",
    chunkFilename: "static/js/[name].chunk.js",
    publicPath: publicPath,
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, "/")
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      name: "vendors"
    },
    runtimeChunk: true
  },
  resolve: {
    modules: ["node_modules", paths.appNodeModules],
    extensions: [".web.js", ".mjs", ".js", ".json", ".web.jsx", ".jsx"],
    alias: {
      "@babel/runtime": path.dirname(
        require.resolve("@babel/runtime/package.json")
      )
    },
    plugins: [
      // Prevents users from importing files from outside of src/ (or node_modules/).
      // This often causes confusion because we only process files within src/ with babel.
      // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
      // please link the files into your node_modules/ and let module-resolution kick in.
      // Make sure your source files are compiled, as they will not be processed in any way.
      new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson])
    ]
  },
  module: {
    strictExportPresence: true,
    rules: [
      { parser: { requireEnsure: false } },

      {
        test: /\.(js|jsx|mjs)$/,
        enforce: "pre",
        use: [
          {
            options: {
              formatter: eslintFormatter,
              eslintPath: require.resolve("eslint"),
              baseConfig: {
                extends: [require.resolve("eslint-config-react-app")]
              },
              ignore: false,
              useEslintrc: false
            },
            loader: require.resolve("eslint-loader")
          }
        ],
        include: paths.appSrc,
        exclude: [/[/\\\\]node_modules[/\\\\]/]
      },
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve("url-loader"),
            options: {
              limit: 10000,
              name: "static/image/[name].[hash:8].[ext]"
            }
          },
          {
            test: /\.(js|jsx)$/,
            include: [paths.appSrc],
            exclude: [/[/\\\\]node_modules[/\\\\]/],
            use: [
              {
                loader: require.resolve("thread-loader"),
                options: {
                  poolTimeout: Infinity
                }
              },
              {
                loader: require.resolve("babel-loader"),
                options: {
                  babelrc: false,
                  plugins: ["transform-decorators-legacy"],
                  presets: [["env"], "stage-1", "react"],
                  cacheDirectory: true,
                  highlightCode: true
                }
              }
            ]
          },
          {
            test: /\.css$/,
            exclude: /\.module\.css$/,
            use: [
              require.resolve("style-loader"),
              {
                loader: require.resolve("css-loader"),
                options: {
                  importLoaders: 1
                }
              }
            ]
          },
          {
            exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
            loader: require.resolve("file-loader"),
            options: {
              name: "static/media/[name].[hash:8].[ext]"
            }
          }
        ]
      }
    ]
  },
  plugins: [
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml
    }),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
    new webpack.DefinePlugin(env.stringified),
    // This is necessary to emit hot updates (currently CSS only):
    new webpack.HotModuleReplacementPlugin(),
    new ProgressBarPlugin(),
    new CaseSensitivePathsPlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new ManifestPlugin({
      fileName: "asset-manifest.json",
      publicPath: publicPath
    })
  ],

  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    dgram: "empty",
    fs: "empty",
    net: "empty",
    tls: "empty",
    child_process: "empty"
  },
  // Turn off performance processing because we utilize
  // our own hints via the FileSizeReporter
  performance: false
};
