const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const Dotenv = require('dotenv-webpack');
const CreateFileWebpack = require('create-file-webpack');

var nodeModules = {};
fs.readdirSync('node_modules')
	.filter(function (x) {
		return ['.bin'].indexOf(x) === -1;
	})
	.forEach(function (mod) {
		nodeModules[mod] = 'commonjs ' + mod;
	});


module.exports = {
	entry: './server.js',
	mode: 'production',
	target: 'node',
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'bundle.js'
	},
	plugins: [
		new Dotenv({
			path: './config/local.env'
		}),
		new CreateFileWebpack({
			path: './dist/logs',
			fileName: 'app-log.log',
			content: '# App Log:'
		})
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader'
				}
			}
		]
	}
}