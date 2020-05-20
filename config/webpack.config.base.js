const webpack = require( 'webpack' );
const path = require( 'path' );
const utils = require( './utils' );
const ManifestPlugin = require( 'webpack-manifest-plugin' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );

const config = mode => {
	return {
		mode: mode,
		entry: {
			app: [
				path.join( __dirname, '../src/index.js' )
			],
			vendors: [ 'react', 'react-dom', 'react-router-dom', 'react-loadable' ],
		},
		output: {
			path: path.join( __dirname, '../dist/' ),
			publicPath: "/",
			filename: "[name].js"
		},
		resolve: { extensions: [ '.js', '.jsx' ] },
		module: {
			rules: [
				{
					test: /\.(js|jsx)$/,
					exclude: /node_modules/,
					include: path.join( __dirname, '../src' ),
					loader: 'babel-loader',
					options: {
						presets: [ "@babel/preset-env", "@babel/preset-react" ],
						plugins: [
							[
								"import",
								{
									"libraryName": "antd",
									"libraryDirectory": "lib",
									"style": true // `style: true` 会加载 less 文件
								}
							]
						]
					}
				},
				{
					test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
					loader: 'url-loader',
					options: {
						limit: 1000,
						name: utils.assetsPath( 'image/[name].[hash:7].[ext]' )
					}
				},
				{
					test: /\.(woff2?|eot|ttf|otf|)(\?.*)?$/,
					loader: 'url-loader',
					options: {
						limit: 1000,
						name: utils.assetsPath( 'fonts/[name].[hash:7].[ext]' )
					}
				}
			]
		},
		plugins: [
			new ManifestPlugin(),
			new webpack.DefinePlugin( {
				'process.env.NODE_ENV': JSON.stringify( mode ),
			} ),
			new HtmlWebpackPlugin( {
				filename: path.resolve( __dirname, '../dist/index.html' ),
				template: 'index.html',
				inject: true,
				minify: {
					removeComments: true,
					collapseWhitespace: true,
					removeAttributeQuotes: true
				},
				chunksSortMode: 'auto',
				chunks: [ 'commons', 'manifest', 'antdVenodr', 'async-commons', 'vendors', 'app' ]
			} ),
		],
		optimization: {
			runtimeChunk: true,
			splitChunks: {
				chunks: 'all',
				minSize: 30000,
				maxSize: 0,
				minChunks: 1,
				maxAsyncRequests: 5,
				maxInitialRequests: 3,
				automaticNameDelimiter: '~',
				name: true,
				cacheGroups: {
					vendors: { // 项目基本框架等
						name: 'vendors',
						test: /[\\/]react|react-dom|react-router-dom|react-loadable[\\/]/,
						chunks: 'all',
						priority: 100
					},
					antdVenodr: { // 异步加载antd包
						test: /(antd)/,
						priority: 100,
						name: 'antdVenodr',
						chunks: 'async'
					},
					'async-commons': {  // 异步加载公共包、组件等
						chunks: 'async',
						minChunks: 2,
						name: 'async-commons',
						priority: 90,
					},
					commons: { // 其他同步加载公共包
						chunks: 'all',
						minChunks: 2,
						name: 'commons',
						priority: 80,
					},
				}
			},
			noEmitOnErrors: true
		}
	}
}

module.exports = config;