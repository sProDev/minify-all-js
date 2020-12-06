#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const promiseSeries = require('promise.series')
const minify = require('@node-minify/core');
const uglifyjs = require('@node-minify/uglify-es');
const babel = require('@node-minify/babel-minify');
const terser = require('@node-minify/terser');
const minifiers = { uglifyjs, babel, terser }

var failed_files = []

const tryMinify = async file => {
  var compressors = Object.keys(minifiers)
  var i = 0

  async function _minify() {
    var compressor = minifiers[compressors[i]]

    try {
      await minify({
        compressor: compressor,
        input: file,
        output: file
      })
      //console.log(`Minified: ${file}`)
      process.stdout.write('.')
    } catch(e) {
      i ++;
      if (compressors[i]) {
        //console.log(`Unable to minify ${file} with ${compressors[i - 1]}, trying with ${compressors[i]}...`)
        await _minify();
      } else {
        //console.log('Error: Unable to compress ' + file)
        process.stdout.write('.')
        failed_files.push(file)
      }
    }
  }
  await _minify();
}

const walk = async (currentDirPath) => {
  await promiseSeries(fs.readdirSync(currentDirPath).map(name => {
    return async () => {
      var filePath = path.join(currentDirPath, name);
      var stat = fs.statSync(filePath);
      var is_bin = /\.bin$/
      if (stat.isFile() && filePath.substr(-3) === ".js") {
        await tryMinify(filePath)
      } else if (stat.isDirectory() && !is_bin.test(filePath)) {
        await walk(filePath);
      }
    }
  }))
}

async function minifyAll (dir){
  await walk(dir);
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
