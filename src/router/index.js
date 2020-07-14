import React from "react";
import loadable from '@loadable/component';
import DefaultLayout from '../layout/DefaultLayout';
import Loading from "../components/Loading";

const Sub = loadable( props => import( `../pages/${ props.path }` ), { fallback: <Loading />, } )

const router = [
	// {
	// 	path: '/login',
	// 	exact: true,
	// 	component: Login,
	// },
	{
		path: '/',
		component: DefaultLayout,
		children: [
			{
				path: '/',
				exact: true,
				component: Sub,
				props: {
					path: "game/backgammon"
				}
			},
			{
				path: '/game/mineSweeping',
				component: Sub,
				props: {
					path: "game/mineSweeping"
				}
			},
			{
				path: '/game/backgammon',
				component: Sub,
				props: {
					path: "game/backgammon"
				}
			},
			{
				path: '/learn/hookLearn',
				component: Sub,
				props: {
					path: "learn/hookLearn"
				}
			},
		]
	}
];

export default router;