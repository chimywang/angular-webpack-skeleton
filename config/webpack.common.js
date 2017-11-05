/*
 * MIT License
 *
 * Copyright (c) 2017 Stefano Cappa
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');
const { NoEmitOnErrorsPlugin, SourceMapDevToolPlugin, NamedModulesPlugin } = require('webpack');
const { NamedLazyChunksWebpackPlugin, BaseHrefWebpackPlugin } = require('@angular/cli/plugins/webpack');
const { CommonsChunkPlugin } = require('webpack').optimize;

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
// const ngcWebpack = require('ngc-webpack');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// const VisualizerPlugin = require('webpack-visualizer-plugin');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
// const OfflinePlugin = require('offline-plugin');
const {AngularCompilerPlugin} = require('@ngtools/webpack');

const HtmlElementsPlugin = require('./html-elements-plugin');

const helpers = require('./helpers');
const TITLE = 'My MEAN Website';
// const TITLE_ADMIN = 'Admin My MEAN Website';
const TEMPLATE_PATH = './src/index.ejs';
// const TEMPLATE_ADMIN_PATH = './src/admin.ejs';
const TEMPLATE_HTML = 'index.html';
// const TEMPLATE_ADMIN_HTML = 'admin.html';

const AOT = helpers.hasNpmFlag('aot');
const PROD = helpers.hasNpmFlag('prod');
const TS_CONFIG = AOT ? 'tsconfig-aot.json' : 'tsconfig.json';

const nodeModules = path.join(process.cwd(), 'node_modules');
const realNodeModules = fs.realpathSync(nodeModules);
const genDirNodeModules = path.join(process.cwd(), 'src', '$$_gendir', 'node_modules');
const entryPoints = ["inline","polyfills","sw-register","styles","vendor","main"];
const minimizeCss = false;
const baseHref = "";
const deployUrl = "";

module.exports = {
  entry: {
    polyfills: './src/polyfills.ts',
    app: './src/main.ts',
    // admin: AOT ? './src/admin.aot.ts' : './src/admin.ts',
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    modules: [helpers.root('src'), helpers.root('node_modules')]
  },
  module: {
    rules: [

      // {
      //   test: require.resolve('jquery'),
      //   use: [
      //     {
      //       loader: 'expose-loader',
      //       options: 'jQuery'
      //     }, {
      //       loader: 'expose-loader',
      //       options: 'jquery'
      //     }, {
      //       loader: 'expose-loader',
      //       options: '$'
      //     }
      //   ]
      // },
      // {
      //   test: require.resolve('popper.js'),
      //   use: [
      //     {
      //       loader: 'expose-loader',
      //       options: 'Popper'
      //     }
      //   ]
      // },
      // {
      //   test: require.resolve('tether'),
      //   use: [
      //     {
      //       loader: 'expose-loader',
      //       options: 'Tether'
      //     },
      //     {
      //       loader: 'expose-loader',
      //       options: 'window.Tether'
      //     }
      //   ]
      // },


      {
        // test: /\.ts$/,
        // use: [
        //   {
        test: /\.ts$/,
        use: ['@ngtools/webpack', '@angularclass/hmr-loader'],
        exclude: [/\.(spec|e2e)\.ts$/]
        // }
        // {
        //   loader: '@angularclass/hmr-loader'
        //   //, options: {
        //   //   pretty: !isProd,
        //   //   prod: isProd
        //   // }
        // },
        // {
        //   loader: 'ng-router-loader',
        //   options: {
        //     loader: 'async-import',
        //     genDir: 'aot',
        //     aot: AOT
        //   }
        // },
        // {
        //   loader: 'awesome-typescript-loader',
        //   options: {
        //     configFile: '${TS_CONFIG}',
        //     useCache: !AOT && !PROD
        //   }
        // },
        // {
        //   loader: 'ngc-webpack',
        //   options: {
        //     // to create smaller aot builds
        //     disable: !AOT,
        //   }
        // },
        // {
        //   loader: 'angular2-template-loader'
        // }
        // ],
        // exclude: [/\.(spec|e2e)\.ts$/]
      },
      {
        test: /\.css$/,
        use: ['to-string-loader', 'css-loader'],
        exclude: [helpers.root('src', 'styles')]
      },
      {
        test: /\.scss$/,
        use: ['to-string-loader', 'css-loader', 'sass-loader'],
        exclude: [helpers.root('src', 'styles')]
      },
      {
        test: /\.html$/,
        use: 'raw-loader',
        exclude: [helpers.root('src/index.html')]
      },
      {
        test: /\.(jpg|png|gif)$/,
        use: 'file-loader'
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'url-loader?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'file-loader'
      }
      //
      //
      // // Bootstrap 4
      // {
      //   test: /bootstrap\/dist\/js\/umd\//,
      //   use: 'imports?jQuery=jquery'
      // }
    ],
    noParse: [
      /node_modules\/@angular\/\*\*\/bundles\//,
      /@angular\/\*\*\/bundles\//
    ]
  },
  plugins: [
    new NoEmitOnErrorsPlugin(),
    new CopyWebpackPlugin([
      {
        "context": ".",
        from: './assets',
        to: './assets'
      },
      {
        "context": ".",
        from: 'node_modules/font-awesome/css/font-awesome.min.css',
        to: 'assets/font-awesome/css/font-awesome.min.css',
      },
      {
        "context": ".",
        from: 'node_modules/font-awesome/fonts',
        to: 'assets/font-awesome/fonts'
      }
    ], {
      "ignore": [
        ".gitkeep"
      ],
      "debug": "warning"
    }),
    new ProgressPlugin(),
    new CircularDependencyPlugin({
      "exclude": /(\\|\/)node_modules(\\|\/)/,
      "failOnError": false
    }),
    new NamedLazyChunksWebpackPlugin(),
    // new OfflinePlugin({
    //   publicPath: '/',
    //   caches: {
    //     main: [
    //       'app.*.css',
    //       'vendor.*.js',
    //       'app.*.js',
    //     ],
    //     additional: [
    //       ':externals:'
    //     ],
    //     optional: [
    //       ':rest:',
    //       'api.github.com',
    //       'https://api.github.com/users/Ks89',
    //       'https://api.github.com/users/Ks89/orgs'
    //     ]
    //   },
    //   externals: [
    //     '/'
    //   ],
    //   excludes: ['**/.*', '**/*.map'],
    //   responseStrategy: 'cache-first',
    //   updateStrategy: 'changed',
    //   autoUpdate: 1000 * 60 * 2,
    //   ServiceWorker: {
    //     events: true,
    //     navigateFallbackURL: '/'
    //   },
    //   AppCache: {
    //     FALLBACK: {
    //       '/': '/offline-page.html'
    //     }
    //   }
    // }),
    // new ModuleConcatenationPlugin(),
    // new NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      title: TITLE,
      inject: 'true', //true or 'head'
      //metadata: METADATA,
      hash: false,
      compile: true,
      favicon: false,
      minify: false,
      cache: true,
      showErrors: true,
      xhtml: true,
      // chunksSortMode: 'dependency',
      chunks: ['polyfills', 'vendor', 'app'],
      excludeChunks: [],
      template: TEMPLATE_PATH,
      filename: TEMPLATE_HTML,
      chunksSortMode: function sort(left, right) {
        let leftIndex = entryPoints.indexOf(left.names[0]);
        let rightindex = entryPoints.indexOf(right.names[0]);
        if (leftIndex > rightindex) {
          return 1;
        }
        else if (leftIndex < rightindex) {
          return -1;
        }
        else {
          return 0;
        }
      }
    }),
    new BaseHrefWebpackPlugin({}),
    new CommonsChunkPlugin({
      "name": [
        "inline"
      ],
      "minChunks": null
    }),
    new CommonsChunkPlugin({
      "name": [
        "vendor"
      ],
      "minChunks": (module) => {
        return module.resource
          && (module.resource.startsWith(nodeModules)
            || module.resource.startsWith(genDirNodeModules)
            || module.resource.startsWith(realNodeModules));
      },
      "chunks": [
        "main"
      ]
    }),
    // new SourceMapDevToolPlugin({
    //   "filename": "[file].map[query]",
    //   "moduleFilenameTemplate": "[resource-path]",
    //   "fallbackModuleFilenameTemplate": "[resource-path]?[hash]",
    //   "sourceRoot": "webpack:///"
    // }),

    //
    // new CommonsChunkPlugin({
    //   name: 'polyfills',
    //   chunks: ['polyfills'],
    //   // minChunks: Infinity
    // }),
    // new CommonsChunkPlugin({
    //   name: 'vendor',
    //   chunks: ['app'/*, 'admin'*/],
    //   minChunks: module => /node_modules\//.test(module.resource) // enables tree-shaking
    // }),
    // new CommonsChunkPlugin({
    //   name: ['polyfills', 'vendor'].reverse()
    // }),
    // new CommonsChunkPlugin({
    //   name: ['manifest'],
    //   minChunks: Infinity,
    // }),
    new CommonsChunkPlugin({
      "name": [
        "main"
      ],
      "minChunks": 2,
      "async": "common"
    }),
    new NamedModulesPlugin({}),

    // new HtmlWebpackPlugin({
    //   title: TITLE_ADMIN,
    //   inject: 'body', //true or 'head'
    //   //metadata: METADATA,
    //   chunksSortMode: 'dependency',
    //   chunks: ['polyfills', 'vendor', 'admin'],
    //   template: TEMPLATE_ADMIN_PATH,
    //   filename: TEMPLATE_ADMIN_HTML
    // }),
    // new ScriptExtHtmlWebpackPlugin({
    //   defaultAttribute: 'defer'
    // }),
    /*
     * Plugin: HtmlElementsPlugin
     * Description: Generate html tags based on javascript maps.
     *
     * If a publicPath is set in the webpack output configuration, it will be automatically added to
     * href attributes, you can disable that by adding a "=href": false property.
     * You can also enable it to other attribute by settings "=attName": true.
     *
     * The configuration supplied is map between a location (key) and an element definition object (value)
     * The location (key) is then exported to the template under then htmlElements property in webpack configuration.
     *
     * Example:
     *  Adding this plugin configuration
     *  new HtmlElementsPlugin({
     *    headTags: { ... }
     *  })
     *
     *  Means we can use it in the template like this:
     *  <%= webpackConfig.htmlElements.headTags %>
     *
     * Dependencies: HtmlWebpackPlugin
     */
    // new HtmlElementsPlugin({
    //   headTags: require('./head-config.common')
    // }),

    // new ContextReplacementPlugin(
    //   The (\\|\/) piece accounts for path separators in *nix and Windows
      // /angular(\\|\/)core(\\|\/)@angular/,
      // helpers.root('./src') // location of your src
    // ),

    // /**
    //  * Plugin: InlineManifestWebpackPlugin
    //  * Inline Webpack's manifest.js in index.html
    //  *
    //  * https://github.com/szrenwei/inline-manifest-webpack-plugin
    //  */
    // new InlineManifestWebpackPlugin(),


    new AngularCompilerPlugin({
      "mainPath": "main.ts",
      "platform": 0,
      "hostReplacementPaths": {
        "environments/environment.ts": "environments/environment.ts"
      },
      "sourceMap": true,
      "tsConfigPath": "tsconfig-aot.json",
      "skipCodeGeneration": true,
      "compilerOptions": {}
    })


    // new ngcWebpack.NgcWebpackPlugin({
    //   disabled: !AOT,
    //   tsConfig: helpers.root('tsconfig-aot.json')
    // }),


    //ProvidePlugin manage build-time dependencies to global symbols whereas the expose-loader manages runtime dependencies to global symbols.
    // new ProvidePlugin({
    //   jQuery: 'jquery',
    //   jquery: 'jquery',
    //   $: 'jquery',
    //   Popper: ['popper.js', 'default'],
    //   'Tether': 'tether',
    //   'window.Tether': 'tether',
    //   //---------------------------------------------------
    //   //------------- temporary workaround ----------------
    //   // https://github.com/shakacode/bootstrap-loader/issues/172#issuecomment-247205500
    //   //this requires exports-loader installed from npm
    //   Tooltip: 'exports-loader?Tooltip!bootstrap/js/dist/tooltip',
    //   Alert: 'exports-loader?Alert!bootstrap/js/dist/alert',
    //   Button: 'exports-loader?Button!bootstrap/js/dist/button',
    //   Carousel: 'exports-loader?Carousel!bootstrap/js/dist/carousel',
    //   Collapse: 'exports-loader?Collapse!bootstrap/js/dist/collapse',
    //   Dropdown: 'exports-loader?Dropdown!bootstrap/js/dist/dropdown',
    //   Modal: 'exports-loader?Modal!bootstrap/js/dist/modal',
    //   Popover: 'exports-loader?Popover!bootstrap/js/dist/popover',
    //   Scrollspy: 'exports-loader?Scrollspy!bootstrap/js/dist/scrollspy',
    //   Tab: 'exports-loader?Tab!bootstrap/js/dist/tab',
    //   Util: 'exports-loader?Util!bootstrap/js/dist/util'
    //   //---------------------------------------------------
    // }),
    // new LoaderOptionsPlugin({
    //   options: {
    //     context: __dirname,
    //     output: {path: './'},
    //     postcss: [autoprefixer],
    //     tslint: {
    //       emitErrors: false,
    //       failOnHint: false,
    //       resourcePath: helpers.root('./src'),
    //       formattersDirectory: './node_modules/tslint-loader/formatters/'
    //     }
    //   }
    // })

    // new BundleAnalyzerPlugin({
    //   // Can be `server`, `static` or `disabled`.
    //   // In `server` mode analyzer will start HTTP server to show bundle report.
    //   // In `static` mode single HTML file with bundle report will be generated.
    //   // In `disabled` mode you can use this plugin to just generate Webpack Stats JSON file by setting `generateStatsFile` to `true`.
    //   analyzerMode: 'disabled',
    //   // Host that will be used in `server` mode to start HTTP server.
    //   analyzerHost: '127.0.0.1',
    //   // Port that will be used in `server` mode to start HTTP server.
    //   analyzerPort: 8888,
    //   // Path to bundle report file that will be generated in `static` mode.
    //   // Relative to bundles output directory.
    //   reportFilename: 'webpack-bundle-analyzer-report.html',
    //   // Automatically open report in default browser
    //   openAnalyzer: true,
    //   // If `true`, Webpack Stats JSON file will be generated in bundles output directory
    //   generateStatsFile: true,
    //   // Name of Webpack Stats JSON file that will be generated if `generateStatsFile` is `true`.
    //   // Relative to bundles output directory.
    //   statsFilename: 'webpack-bundle-analyzer-report.json',
    //   // Options for `stats.toJson()` method.
    //   // For example you can exclude sources of your modules from stats file with `source: false` option.
    //   // See more options here: https://github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
    //   statsOptions: null,
    //   // Log level. Can be 'info', 'warn', 'error' or 'silent'.
    //   logLevel: 'info'
    // }),
    // new VisualizerPlugin({
    //   filename: './webpack-visualizer-report.html'
    // })
  ],
  "node": {
    "fs": "empty",
    "global": true,
    "crypto": "empty",
    "tls": "empty",
    "net": "empty",
    "process": true,
    "module": false,
    "clearImmediate": false,
    "setImmediate": false
  },
  "devServer": {
    "historyApiFallback": true
  }
};
