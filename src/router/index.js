import React from "react";
import loadable from '@loadable/component';
import DefaultLayout from '../layout/DefaultLayout';
import Loading from "../components/Loading";

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
				component: loadable(
					() => import( '../pages/game/Backgammon' ),
					{ fallback: <Loading />, }
				),
			},
			{
				path: '/game/mineSweeping',
				component: loadable(
					() => import( '../pages/game/MineSweeping' ),
					{ fallback: <Loading />, }
				),
			},
			{
				path: '/game/backgammon',
				component: loadable(
					() => import( '../pages/game/Backgammon' ),
					{ fallback: <Loading />, }
				),
			},
			{
				path: '/learn/hookLearn',
				component: loadable(
					() => import( '../pages/learn/HookLearn' ),
					{ fallback: <Loading />, }
				),
			},
		]
	}
];

export default router;