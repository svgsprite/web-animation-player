
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = {

	context: path.resolve(__dirname, 'src'),
	entry: './index.js',

	devtool: 'cheap-eval-source-map',

	output: {
		path: path.resolve(__dirname, 'build'),
		filename: 'bundle.js'
	},

	resolve: {
		extensions: ['.jsx', '.js', '.json'],
		modules: [
			path.resolve(__dirname, 'node_modules'),
			'node_modules'
		]
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				options: {
					plugins: [
						['transform-react-jsx', { pragma: 'h' }]
					]
				}
			},
			{
				test: /\.scss$/,
				use: [
					'style-loader',
					'css-loader',
					'sass-loader'
				],
			},
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
		}),
		new HtmlWebpackPlugin({
			template: './index.htm',
		})
	]
}