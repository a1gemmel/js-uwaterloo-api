module.exports = {
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /(node_modules)|(bower_components)/,
				loader: 'babel-loader',
				query: {
					presets: [
						'es2015',
					]
				}
			},
		]
	},
	entry: './lib/uwapi.js',
	output: {
		filename: 'uwapi.dist.js',
		path: './dist'
	}
};
