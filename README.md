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
 - `-p` or `--packagejson` to clean up extra fields from package.json files (default: false)
 - `-a` or `--all` to try to compress all files including binary/executable js files without `.js` extension (default: false)

### Run programatically

```js
  var promise = minifyAllJs([directory], {
    compress_json: true, // -j in cli
    module: true,        // -m in cli
    mangle: true,        // -M in cli
    packagejson: true,   // -p in cli
    all_js: true         // -a in cli
  })
```

`minifyAllJs` function returns a **promise**
