# minify-all-js

A function that minifies your javascript files (recursively). **minify-all-js** can be used as a CLI or can be run in your code. By giving it a directory, `minify-all-js` will walk through the depth of your folders and minify all the javascript that it sees.

### Installation

    > npm install -g minify-all-js

### Run CLI

    > minify-all-js [folder] [-j] [-m] [-M]

Use CLI options:
 - `-j` or `--json` to compress json files as well. (default: `false`)
 - `-m` or `--module` to set terser module option to `true` for ES6 files (default: `false`)
 - `-M` or `--mangle` to set terser mangle option to `true` (default: `false`)

### Run programatically

```js
  var promise = minifyAllJs([directory], {compress_json: true, module: true, mangle: true})
```

`minifyAllJs` function returns a **promise**
