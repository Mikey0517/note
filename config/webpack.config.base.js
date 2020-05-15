const webpack = require( 'webpack' );
const path = require( 'path' );
const utils = require( './utils' );
const ManifestPlugin = require( 'webpack-manifest-plugin' );

const config = mode => {
	return {
		mode: mode,
		entry: {
			app: [
				path.join( __dirname, '../src/index.js' )
			],
			vendors: [ 'react', 'react-dom', 'react-loadable' ],
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
		],
		optimization: {
			splitChunks: {
				chunks: 'async',
				minSize: 30000,
				maxSize: 0,
				minChunks: 1,
				maxAsyncRequests: 5,
				maxInitialRequests: 3,
				automaticNameDelimiter: '~',
				name: true,
				cacheGroups: {
					reactBase: {
						name: 'react-base',
						test: module => {
							return /react|prop-types/.test( module.context );
						},
						chunks: 'initial',
						priority: 10,
					},
					common: {
						test: /[\\/]node_modules[\\/]/,
						name: 'common',
						chunks: 'initial',
						priority: 2,
						minChunks: 2,
					},
				}
			},
			noEmitOnErrors: true
		}
	}
}

module.exports = config;