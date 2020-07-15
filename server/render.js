const SSR = require( "../dist/node/main" );const ssr = new SSR();const prepHTML = ( { title, html, linkTags, styleTags, scriptTags, initialData } ) => {	return `    <!DOCTYPE html>    <html lang="en">      <head>        <meta charset="UTF-8">        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no">        <title>${ title || 'React App' }</title>        <link rel="shortcut icon" href="/favicon.svg">        ${ linkTags }        ${ styleTags }      </head>      <body>        <div id="root">${ html }</div>      </body>      <script id="__INITIAL_DATA__" type="application/json">${ JSON.stringify( initialData || {}, ) }</script>      ${ scriptTags }    </html>  `;}const render = ctx => {	console.log( ctx.path )	if ( global.routers.includes( ctx.path ) ) {		const context = {};		const rendered = ssr.render( ctx.url, {}, context );		// ctx.type = 'html';		ctx.body = prepHTML( rendered )	} else {		ctx.code = 404;	}}module.exports = render;