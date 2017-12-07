const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');

const SRC_PATH = path.resolve(__dirname, 'src');
const OUTPUT_PATH = path.resolve(__dirname, 'build');

const PROD = process.env.NODE_ENV === 'production';

const BASE_STYLES = [
	{
		loader: 'css-loader',
		options: {
			modules: true,
			localIdentName: PROD ? '[hash:base64:5]' : '[name]__[local]___[hash:base64:5]',
			importLoaders: 1,
			minimize: true
		}
	},
	{
		loader: 'sass-loader',
		options: {
			sourceMap: true,
			includePaths: [
				'node_modules'
			]
		}
	}
];

const DEV_CONFIG = [ 'style-loader' ].concat(BASE_STYLES);
const PROD_CONFIG = ExtractTextPlugin.extract({
	fallback: 'style-loader',
	use: BASE_STYLES,
	publicPath: '/'
});


let plugins = [
	new webpack.DefinePlugin({
		'process.env': {
			NODE_ENV: JSON.stringify(process.env.NODE_ENV),
		}
	}),
	new webpack.HashedModuleIdsPlugin(),
	new webpack.optimize.CommonsChunkPlugin({
		name: 'common',
		minChunks: Infinity
	}),
	new ExtractTextPlugin({
		filename: 'styles.[hash].css',
		allChunks: true
	}),
	new HtmlWebpackPlugin({
		title: 'Currency Chart',
		inject: 'body',
		hash: true,
		cache: true,
		template: path.resolve(__dirname, 'index.template.hbs')
	}),
	new CleanWebpackPlugin([
		OUTPUT_PATH
	])
];

console.log(PROD);

if (PROD) {
	plugins.push(
		new webpack.optimize.UglifyJsPlugin()
	);
}
module.exports = {
	entry: [
		path.resolve(SRC_PATH, 'polyfills.js'),
		path.resolve(SRC_PATH, 'index.js')
	],
	output: {
		filename: '[name].[hash].js',
		path: OUTPUT_PATH,
		chunkFilename: '[name].[chunkhash].js',
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: 'babel-loader'
			},
			{
				test: /\.(hbs|handlebars)$/,
				use: 'handlebars-loader'
			},
			{
				test: /\.scss$/,
				exclude: /node_modules/,
				use: PROD ? PROD_CONFIG : DEV_CONFIG,
			}
		]
	},
	resolve: {
		extensions: [ '.js', '.jsx' ],
		modules: [
			'node_modules',
			SRC_PATH,
		],
		alias: {
			utility: path.resolve(__dirname, 'src', 'utility')
		}
	},
	devtool: 'source-map',
	plugins: plugins
};