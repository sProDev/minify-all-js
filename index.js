#!/usr/bin/env node

const fs = require("fs");
const { promisify } = require('util')
const path = require("path");
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const readdir = promisify(fs.readdir)
const promiseSeries = require('promise.series')
const minify = require('@node-minify/core');
const terser = require('@node-minify/terser');

var failed_files = []
var total_files = 0
var options = {}

const minifyJS = async file => {
  total_files ++

  async function _minify() {
    try {
      await minify({
        compressor: terser,
        input: file,
        output: file,
        options: {
          warnings: true,
          module: options.module,
          mangle: false,
          compress: false
        }
      })
    } catch(e) {
      failed_files.push(file)
    }
    process.stdout.write('.')
  }
  await _minify();
}

const minifyJSON = async file => {
  total_files ++
  var data = await readFile(file, 'utf8')
  var json = JSON.parse(data)
  try {
    await writeFile(file, JSON.stringify(json))
  } catch(e) {}
}

const walk = async (currentDirPath) => {
  var js_files = []
  var json_files = []
    var dirs = []
  var current_dirs = await readdir(currentDirPath)
  current_dirs.forEach(name => {
    var filePath = path.join(currentDirPath, name);
    var stat = fs.statSync(filePath);
    var is_bin = /\.bin$/
    if (stat.isFile()) {
      if (filePath.substr(-3) === ".js")
        js_files.push(filePath)
      if (options.compress_json && filePath.substr(-5) === ".json")
        json_files.push(filePath)
    } else if (stat.isDirectory() && !is_bin.test(filePath)) {
      dirs.push(filePath)
    }
  })
  var js_promise = Promise.all(js_files.map(f => minifyJS(f)))
  var json_promise = Promise.all(json_files.map(f => minifyJSON(f)))
  await Promise.all([js_promise, json_promise])
  await promiseSeries(dirs.map(dir => () => walk(dir)))
}

async function minifyAll (dir, opts){
  Object.assign(options, opts || {})
  await walk(dir);
  process.stdout.write('.\n')
  console.log('Total found files: ' + total_files)
  if (failed_files.length) {
    console.log(`\n\nFailed to minify files:`)
    failed_files.forEach(f => console.log('\t' + f))
  }
};

if (require.main === module) {
  var input = process.argv;
  var inputDir = input[2];

  options.compress_json = input.includes('-j') || input.includes('-p')
  options.module = input.includes('-m')

  minifyAll(inputDir);

} else {
  module.exports = minifyAll;
}
