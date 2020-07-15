const Router = require( "koa-router" );const koaBody = require( "koa-body" );const { login, webSocketController } = require( "./controller" );const getApi = () => {	const api = new Router( {		prefix: '/api'	} );	api.post( '/login', koaBody(), login.login );	api.get( '/getOnLineList', webSocketController.getOnLineList )	return api;};module.exports = getApi();