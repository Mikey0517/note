import Koa from 'koa';import json from 'koa-json';import router from './router';import webpack from 'webpack';import hotMiddleware from 'koa-webpack-hot-middleware';import devMiddleware from 'koa-webpack-dev-middleware';import historyApiFallback from 'koa2-connect-history-api-fallback';import config from '../config/webpack.config.dev';const app = new Koa();const port = 3000;const uri = 'http://localhost:' + port;const compiler = webpack( config );const instance = devMiddleware( compiler, {	publicPath: '/',	quiet: false,	stats: {		colors: true	}} );app.use(	historyApiFallback( {		htmlAcceptHeaders: [ 'text/html', 'application/xhtml+xml' ]	} ))app.use( instance );app.use( hotMiddleware( compiler, {	log: false,	heartbeat: 10000,} ) );app.use( json() );app.use( async ( ctx, next ) => {	let start = new Date();	await next();	let ms = new Date() - start;	console.log( '%s %s - %s', ctx.method, ctx.url, ms );} )app.use( async ( ctx, next ) => {  //  如果JWT验证失败，返回验证失败信息	try {		await next();	} catch ( err ) {		if ( err.status === 401 ) {			ctx.status = 401;			ctx.body = {				success: false,				token: null,				info: 'Protected resource, use Authorization header to get access'			}		} else {			throw err		}	}} )app.use( router.routes() );app.use( router.allowedMethods() );app.on( 'error', ( err ) => {	console.log( 'server error', err );} )console.log( '> Starting dev server...' );app.listen( port, () => {	console.log( '> Listening at ' + uri + '\n' )} )