const merge = require( 'webpack-merge' );const TerserWebpackPlugin = require( 'terser-webpack-plugin' );const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;const PreloadWebpackPlugin = require( 'preload-webpack-plugin' );const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );const baseConfig = require( './webpack.config.base' );const os = require( 'os' );console.log( os.cpus().length )const config = require( './env' );const utils = require( './utils' );const isBundleAnalyzerEnabled = config.isBundleAnalyzerEnabled();const isSSREnabled = config.isSSREnabled();const isCSSModules = config.isCSSModules();let webpackConfig = merge( baseConfig, {	output: {		publicPath: config.getStaticAssetsEndpoint() + utils.getPublicPath(),		filename: utils.getName( 'assets/js/[name]', 'js', '', false ),	},	module: {		rules: [			...utils.getAllStyleRelatedLoaders(				false,				false,				isCSSModules,				'[local]-[hash:base64:5]',			),		],	},	mode: 'production',	stats: { children: false, warnings: false },	plugins: [		new MiniCssExtractPlugin( {			filename: utils.getName( 'assets/css/[name]', 'css', 'contenthash', false ),		} ),		new PreloadWebpackPlugin( {			rel: 'preload',			include: 'initial',		} ),	],	optimization: {		namedModules: false,		runtimeChunk: { name: utils.ENTRY_NAME.VENDORS },		noEmitOnErrors: true,		concatenateModules: !isSSREnabled,		splitChunks: {			cacheGroups: {				vendors: {					test: /[\\/]node_modules[\\/]/i,					name: utils.ENTRY_NAME.VENDORS,					chunks: 'initial',				},			},		},		minimizer: [			new TerserWebpackPlugin( {				terserOptions: {					warnings: false,					compress: {						warnings: false,						drop_console: true,						dead_code: true,						drop_debugger: true,					},					output: {						comments: false,						beautify: false,					},					mangle: true,				},				parallel: os.cpus().length - 1,				sourceMap: false,			} ),		],	},} );if ( isBundleAnalyzerEnabled ) {	webpackConfig.plugins.push( new BundleAnalyzerPlugin() );}module.exports = webpackConfig;