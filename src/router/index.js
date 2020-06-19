import Loadable from 'react-loadable';
import DefaultLayout from '../layout/defaultLayout';
import Loading from "../component/loading";

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
				component: Loadable( {
					loader: () => import( '../page/backgammon' ),
					loading: Loading
				} ),
			},
			{
				path: '/game/mineSweeping',
				component: Loadable( {
					loader: () => import( '../page/mineSweeping' ),
					loading: Loading
				} ),
			},
			{
				path: '/game/backgammon',
				component: Loadable( {
					loader: () => import( '../page/backgammon' ),
					loading: Loading
				} ),
			},
		]
	}
];

export default router;