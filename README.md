# minify-all-js

A function that minifies your javascript files (recursively). **minify-all-js** can be used as a CLI or can be run in your code. By giving it a directory, `minify-all-js` will walk through the depth of your folders and minify all the javascript that it sees.

### Installation

    > npm install -g minify-all-js

### Run CLI

    > minify-all-js [folder]

### Run in your code
`minifyAllJs` function has only 1 option 

```js
  minifyAllJs([directory])
```

##### Example

    var minifyAll = require("minify-all-js");
    
    minifyAll("./node_modules");

