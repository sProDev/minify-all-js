const fs = require("fs")
const { promisify } = require('util')
const path = require("path")
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const readdir = promisify(fs.readdir)
const promiseSeries = require('promise.series')
const minify = require('@node-minify/core')
const terser = require('@node-minify/terser')

var options = {
	json: false,
	module: false,
	mangle: false,
	packageJson: false,
	all: false
}

const javascript = async (file) => {
	try {
		await minify({
			compressor: terser,
			input: file,
			output: file,
			options: {
				module: options.module,
				mangle: options.mangle,
				compress: true
			}
		})
	} catch (e) { }
}

const json = async (file) => {
	try {
		if ((options.json || options.packageJson)) {
			var isPackageJson = file.indexOf('package.json') > -1
			var data = await readFile(file, 'utf8')
			var json = JSON.parse(data)
			var newJson = {}

			if (options.packageJson && isPackageJson) {
				var { name, version, bin, main, binary, engines } = json
				newJson = { name, version }

				if (bin) newJson.bin = bin
				if (binary) newJson.binary = binary
				if (main) newJson.main = main
				if (engines) newJson.engines = engines
			} else {
				newJson = json
			}
			await writeFile(file, JSON.stringify(newJson))
		}
	} catch (e) { }
}

const walk = async (currentDirPath) => {
	var jsFiles = []
	var jsonFiles = []
	var dirs = []
	var currentDirs = await readdir(currentDirPath)

	currentDirs.forEach(name => {
		var filePath = path.join(currentDirPath, name)
		var stat = fs.statSync(filePath)
		var is_bin = /\.bin$/

		if (stat.isFile()) {
			if (filePath.substring(filePath.length - 5) === ".json") {
				jsonFiles.push(filePath)
			} else if (filePath.substring(filePath.length - 3) === ".js" || options.all) {
				jsFiles.push(filePath)
			}
		} else if (stat.isDirectory() && !is_bin.test(filePath)) {
			dirs.push(filePath)
		}
	})

	var jsPromise = Promise.all(jsFiles.map(f => javascript(f)))
	var jsonPromise = Promise.all(jsonFiles.map(f => json(f)))

	await Promise.all([jsPromise, jsonPromise])
	await promiseSeries(dirs.map(dir => () => walk(dir)))
}

module.exports = async function all(dir, opts) {
	Object.assign(options, opts || {})
	await walk(dir)
}
