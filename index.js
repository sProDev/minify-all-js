#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const minify = require('@node-minify/core');
const uglifyjs = require('@node-minify/uglify-js');
const babel = require('@node-minify/babel-minify');
const terser = require('@node-minify/terser');

const minifiers = { uglifyjs, babel, terser }

var failed_files = []

function walk (currentDirPath, callback) {
  fs.readdirSync(currentDirPath).forEach(function(name) {
    var filePath = path.join(currentDirPath, name);
    var stat = fs.statSync(filePath);
    var is_bin = /\.bin$/
    if (stat.isFile()) {
      callback(filePath, stat);
    } else if (stat.isDirectory() && !is_bin.test(filePath)) {
      walk(filePath, callback);
    }
  });
}

function tryMinify(path, minifier) {
  var compressors = Object.keys(minifiers)
  var i = 0

  function _minify() {
    var compressor = minifiers[compressors[i]]
    minify({
      compressor: compressor,
      input: path,
      output: path
    })
      .then(function () {
        console.log(`Minified: ${path}`)
      })
      .catch(function (err) {
        i ++;
        if (compressors[i]) {
          console.log(`Unable to minify ${path} with ${compressors[i - 1]}, trying with ${compressors[i]}...`)
          _minify();
        } else {
          console.log('Error: Unable to compress ' + path)
          failed_files.push(path)
        }
      });
  }

  _minify();

}

function minifyAll (dir){

  walk(dir, function(path){
    if (path.substr(-3) === ".js"){
      //console.log("found file: " + path);
      tryMinify(path)
    }
  });
};

if (require.main === module) {
  var input = process.argv;
  var inputDir = input[2];
  minifyAll(inputDir);
} else {
  module.exports = minifyAll;
}
