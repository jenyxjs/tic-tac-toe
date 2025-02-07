/**
 * npm install rollup --global
 * rollup -wc /srv/tic-tac-toe/docs/rollup.config.mjs
 */

export default {
	input: '/srv/tic-tac-toe/www/src/App/App.js',
	output: [
		{
			file: '/srv/tic-tac-toe/www/bundle.js',
			sourcemap: true
		},
	],
};