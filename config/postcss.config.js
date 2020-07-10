const cssnano = require( 'cssnano' );
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
	plugins: [
		require( 'postcss-import' ),
		require( 'tailwindcss' )('./config/tailwindcss-config.js'),
		require( 'postcss-preset-env' )( { stage: 1 } ),
		isProd ? cssnano( { preset: 'default' } ) : null,
	],
};
