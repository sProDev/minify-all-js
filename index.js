#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const promiseSeries = require('promise.series')
const minify = require('@node-minify/core');
const terser = require('@node-minify/terser');

var failed_files = []
var total_files = 0

const tryMinify = async file => {
  total_files ++

  async function _minify() {
    try {
      await minify({
        compressor: terser,
        input: file,
        output: file,
        options: {
          warnings: true,
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

const walk = async (currentDirPath) => {
  var files = []
  var dirs = []
  fs.readdirSync(currentDirPath).forEach(name => {
    var filePath = path.join(currentDirPath, name);
    var stat = fs.statSync(filePath);
    var is_bin = /\.bin$/
    if (stat.isFile() && filePath.substr(-3) === ".js") {
      files.push(filePath)
    } else if (stat.isDirectory() && !is_bin.test(filePath)) {
      dirs.push(filePath)
    }
  })
  await Promise.all(files.map(f => tryMinify(f)))
  await promiseSeries(dirs.map(dir => () => walk(dir)))
}

async function minifyAll (dir){
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
  minifyAll(inputDir);
} else {
  module.exports = minifyAll;
}
