import React from "react";import Router from 'koa-router';import koaBody from 'koa-body';import { login } from './controller'const getRouter = () => {	const router = new Router( {		prefix: '/api'	} );	router.post( '/login', koaBody(), login.login );	return router;};module.exports = getRouter();