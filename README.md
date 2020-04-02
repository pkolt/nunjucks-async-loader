# nunjucks-async-loader ![](https://github.com/pkolt/nunjucks-async-loader/workflows/main/badge.svg)

  Asynchronous loader templates [nunjucks](http://mozilla.github.io/nunjucks/).

## Why You Need?

  [nunjucks.FileSystemLoader](https://mozilla.github.io/nunjucks/api.html#filesystemloader) loads templates synchronously.
  See this [issue](https://github.com/mozilla/nunjucks/issues/726).

## Installation

```bash
$ npm install nunjucks-async-loader --save
```

## Usage

```javascript
const express = require('express');
const nunjucks = require('nunjucks');
const nunjucksAsyncLoader = require('nunjucks-async-loader');

const app = express();
const isDev = app.get('env') === 'development';

const loader = new nunjucksAsyncLoader('views', {
    watch: isDev, // (default: false) reload templates when they are changed.
    noCache: isDev // (default: false) never use a cache and recompile templates each time.
});

const env = new nunjucks.Environment(loader);

env.express(app);


app.get('/', function(req, res) {
    res.render('index.html');
});

app.listen(3000);
```

## Tests

  To run the test suite, first install the dependencies, then run `npm test`:

```bash
$ npm install
$ npm test
```

## License

  [MIT](LICENSE.md)
