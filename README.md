# minify-all-js

A function that minifies your javascript files (recursively).
**minify-all-js** was designed to reduce the size of your project's `node_modules` directory. But it can also be used to minify any js files. By giving it a directory, `minify-all-js` will walk through the depth of your folders and minify all the javascript that it sees.

### Installation

    > npm install -g minify-all-js

### Run CLI

    > minify-all-js [folder] [-j] [-m] [-M] [-p]

##### Sample

    > minify-all-js ./node_modules -j -m -M -p

Use CLI options:
 - `-j` or `--json` to compress json files as well. (default: `false`)
 - `-m` or `--module` to set terser module option to `true` for ES6 files (default: `false`)
 - `-M` or `--mangle` to set terser mangle option to `true` (default: `false`)
 - `-p` or `--packagejson` to clean up extra fields from package.json files

### Run programatically

```js
  var promise = minifyAllJs([directory], {
    compress_json: true,
    module: true,
    mangle: true,
    packagejson: true
  })
```

`minifyAllJs` function returns a **promise**
