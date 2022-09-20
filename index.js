const fs = require("fs")
const path = require("path")
const { promisify } = require('util')
const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const minify = require('@node-minify/core')
const terser = require('@node-minify/terser')
const promiseSeries = require('promise.series')
const obfuscator = require('javascript-obfuscator')

let options = {
  all: false,
  json: false,
  module: false,
  mangle: false,
  obfuscate: false,
  packageJson: false,
}

const javascript = async (file) => {
  try {
    if (options.obfuscate) {
      const content = fs.readFileSync(file, { encoding: 'utf-8' })
      const obfuscated = obfuscator.obfuscate(content)
      fs.writeFileSync(file, obfuscated.getObfuscatedCode(), { encoding: 'utf-8' })
    }

    await minify({
      compressor: terser,
      input: file,
      output: file,
      options: {
        module: options.module,
        mangle: options.mangle,
        compress: { reduce_vars: false }
      }
    })
  } catch (e) { }
}

const json = async (file) => {
  try {
    if (options.json || options.packageJson) {
      const isPackageJson = file.indexOf('package.json') > -1
      const data = await readFile(file, 'utf8')
      const json = JSON.parse(data)
      let newJson = {}

      if (options.packageJson && isPackageJson) {
        const { name, version, bin, main, binary, engines } = json
        newJson = { name, version }

        if (bin) newJson.bin = bin
        if (binary) newJson.binary = binary
        if (main) newJson.main = main
        if (engines) newJson.engines = engines
      } else {
        newJson = json
      }

      if ((options.packageJson && isPackageJson) || !isPackageJson) {
        await writeFile(file, JSON.stringify(newJson))
      }
    }
  } catch (e) { }
}

const walk = async (currentPath) => {
  const jsFiles = []
  const jsonFiles = []
  const dirs = []
  const currentDirs = await readdir(currentPath)

  currentDirs.forEach(name => {
    const filePath = path.join(currentPath, name)
    const stat = fs.statSync(filePath)
    const isBin = /\.bin$/

    if (stat.isFile()) {
      if (filePath.substring(filePath.length - 5) === ".json") {
        jsonFiles.push(filePath)
      } else if (filePath.substring(filePath.length - 3) === ".js" || options.all) {
        jsFiles.push(filePath)
      }
    } else if (stat.isDirectory() && !isBin.test(filePath)) {
      dirs.push(filePath)
    }
  })

  const jsPromise = Promise.all(jsFiles.map(file => javascript(file)))
  const jsonPromise = Promise.all(jsonFiles.map(file => json(file)))

  await Promise.all([jsPromise, jsonPromise])
  await promiseSeries(dirs.map(dir => () => walk(dir)))
}

module.exports = async function all(dir, opts) {
  Object.assign(options, opts || {})
  await walk(dir)
}
