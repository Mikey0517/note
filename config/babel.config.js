function isAntd ( caller ) {
	return Boolean( caller && caller.antd )
}

module.exports = function ( api ) {
	const antd = api.caller( isAntd );
	const DEV_MODE = api.env( 'development' );
	api.cache( true );
	let config = {
		presets: [
			[
				'@babel/preset-env',
				{
					useBuiltIns: 'usage',
					modules: false,
					corejs: 3,
				},
			],
			[
				'@babel/preset-react',
				{
					development: DEV_MODE,
				},
			],
		],
		env: {
			development: {
				plugins: [
					[
						'babel-plugin-styled-components',
						{
							displayName: DEV_MODE,
						},
					],
					'@babel/plugin-transform-react-jsx-source',
				],
			},
			test: {
				presets: [
					[
						'@babel/preset-env',
						{
							modules: false,
						},
					],
					'@babel/preset-react',
				],
				plugins: [
					[
						'babel-plugin-styled-components',
						{
							displayName: DEV_MODE,
						},
					],
					'@babel/plugin-transform-react-jsx-source',
					'dynamic-import-node',
				],
			},
		},
		plugins: [
			[
				'babel-plugin-styled-components',
				{
					displayName: DEV_MODE,
				},
			],
			'@babel/plugin-transform-runtime',
			'@babel/plugin-proposal-object-rest-spread',
			'@babel/plugin-proposal-class-properties',
			'@babel/plugin-syntax-dynamic-import',
			'@babel/plugin-transform-modules-commonjs',
			'@loadable/babel-plugin'
		],
	};
	if ( antd ) {
		config.plugins.push( [
			"import",
			{
				"libraryName": "antd",
				"libraryDirectory": "lib",
				"style": "css" // `style: true` 会加载 less 文件
			}
		] )
	}
	return config;
};
