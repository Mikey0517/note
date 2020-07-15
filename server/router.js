const fs = require( "fs" );
const path = require( "path" );

const router = ( url ) => {
	return [ '/' ].concat( recursive( url, url ) );
}

const recursive = ( rootPath, url ) => {
	let paths = [];

	const files = fs.readdirSync( url );
	const length = files.length;
	for ( let i = 0; i < length; i++ ) {
		const filePath = path.join( url, files[ i ] );
		const fileStat = fs.statSync( filePath );
		if ( fileStat.isDirectory() ) {
			paths = paths.concat( recursive( rootPath, filePath ) );
		} else {
			paths.push( filePath.split( rootPath )[ 1 ].split( path.sep ).join( '/' ).split( '.jsx' )[ 0 ] );
		}
	}

	return paths;
}

module.exports = router;