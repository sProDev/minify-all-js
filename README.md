# minify-all-js

A function that minifies your javascript files (recursively). **minify-all-js** can be used as a CLI or can be run in your code. By giving it a directory, `minify-all-js` will walk through the depth of your folders and minify all the javascript that it sees.

### Installation

    > npm install -g minify-all-js

### Run CLI

    > minify-all-js [folder] [-j or -p] [-m]

Use CLI options:
 - `-p` or `-j` to compress json files as well.
 - `-m` to set terser options module to `true`

### Run in your code
`minifyAllJs` function returns a promise 

```js
  minifyAllJs([directory], {compress_json: true, module: true})
```

##### Options


##### Example

    var minifyAll = require("minify-all-js");
    
    minifyAll("./node_modules");


