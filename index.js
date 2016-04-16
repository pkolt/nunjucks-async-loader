var fs = require('fs');
var path = require('path');
var nunjucks = require('nunjucks');
var co = require('co');
var Promise = require('bluebird');

var fsStat = Promise.promisify(fs.stat);
var fsReadFile = Promise.promisify(fs.readFile);

var FileSystemAsyncLoader = nunjucks.Loader.extend({
    async: true,

    init: function(searchPaths, opts) {
        opts = opts || {};

        searchPaths = typeof searchPaths === 'string' ? [searchPaths] : searchPaths;
        this.searchPaths = searchPaths || ['.'];
        this.noCache = !!opts.noCache;
    },

    getSourceAsync: co.wrap(function*(name) {
        var res = null;
        var paths = this.searchPaths;

        if (!name) {
            throw new Error('The `name` parameter is not specified: ' + name);
        }

        for (var i = 0; i < paths.length; i++) {
            var p = paths[i];
            var basePath = path.resolve(p);
            var fullPath = path.resolve(p, name);
            if (fullPath.indexOf(basePath) === 0) {
                var stat;
                try {
                    stat = yield fsStat(fullPath);
                } catch (err) {
                    stat = null;
                }
                
                if (stat && stat.isFile()) {
                    var data = yield fsReadFile(fullPath, 'utf-8');
                    res = {src: data, path: fullPath, noCache: this.noCache};
                    break;
                }
            }
        }
        return res;
    }),

    getSource: function(name, cb) {
        this.getSourceAsync(name)
            .then(function(res) {
                cb(null, res);
            })
            .catch(cb);
    }
});

module.exports = FileSystemAsyncLoader;
