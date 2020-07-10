module.exports = {
	defaultSelectedKeys: '/game/backgammon',
	defaultOpenKeys: '/game',
	menu: [
		{
			title: '游戏',
			path: '/game',
			children: [
				{
					title: '五子棋对战',
					path: '/backgammon'
				},
				{
					title: '扫雷',
					path: '/mineSweeping'
				}
			]
		},
		{
			title: '学习',
			path: '/learn',
			children: [
				{
					title: 'Hook 学习',
					path: '/hookLearn'
				}
			]
		}
	]
}