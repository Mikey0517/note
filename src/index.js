import React from 'react';import ReactDOM from 'react-dom';import { loadableReady } from '@loadable/component';import App from './App';import AppError from 'components/AppError';import 'modules/env';import 'src/style/common.css';const root = document.getElementById( 'root' );const render = Component => {	// eslint-disable-next-line no-undef	if ( __SSR__ ) {		console.log( 'in SSR mode' );		loadableReady.then( () => {			ReactDOM.hydrate(				<AppError>					<Component/>				</AppError>,				root,			);		} );		return;	}	ReactDOM.render(		<AppError>			<Component/>		</AppError>,		root,	);};render( App );