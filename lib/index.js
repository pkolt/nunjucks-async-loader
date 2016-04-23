'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

require('babel-polyfill');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _nunjucks = require('nunjucks');

var _nunjucks2 = _interopRequireDefault(_nunjucks);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _es6Promisify = require('es6-promisify');

var _es6Promisify2 = _interopRequireDefault(_es6Promisify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

var fsStat = (0, _es6Promisify2.default)(_fs2.default.stat);
var fsReadFile = (0, _es6Promisify2.default)(_fs2.default.readFile);

var FileSystemAsyncLoader = _nunjucks2.default.Loader.extend({
    async: true,

    init: function init(searchPaths, opts) {
        opts = opts || {};
        this.pathsToNames = {};

        if (searchPaths) {
            searchPaths = Array.isArray(searchPaths) ? searchPaths : [searchPaths];
            searchPaths = searchPaths.map(_path2.default.normalize);
        } else {
            searchPaths = ['.'];
        }

        this.searchPaths = searchPaths;
        this.noCache = !!opts.noCache;

        if (opts.watch) {
            this.watchDirs(searchPaths).catch(console.error);
        }
    },

    watchDirs: function () {
        var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(searchPaths) {
            var paths, i, fullPath, stat, self, watcher;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            paths = [];
                            i = 0;

                        case 2:
                            if (!(i < searchPaths.length)) {
                                _context.next = 17;
                                break;
                            }

                            fullPath = _path2.default.resolve(searchPaths[i]);
                            _context.prev = 4;
                            _context.next = 7;
                            return fsStat(fullPath);

                        case 7:
                            stat = _context.sent;
                            _context.next = 13;
                            break;

                        case 10:
                            _context.prev = 10;
                            _context.t0 = _context['catch'](4);

                            stat = null;

                        case 13:
                            if (stat && stat.isDirectory()) {
                                paths.push(fullPath);
                            }

                        case 14:
                            i++;
                            _context.next = 2;
                            break;

                        case 17:
                            self = this;
                            watcher = _chokidar2.default.watch(paths);


                            watcher.on('all', function (event, fullPath) {
                                fullPath = _path2.default.resolve(fullPath);
                                if (event === 'change' && fullPath in self.pathsToNames) {
                                    self.emit('update', self.pathsToNames[fullPath]);
                                }
                            });

                            watcher.on('error', function (err) {
                                console.error('Watcher error: ' + err);
                            });

                        case 21:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[4, 10]]);
        }));

        function watchDirs(_x) {
            return ref.apply(this, arguments);
        }

        return watchDirs;
    }(),

    getSourceAsync: function () {
        var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(name) {
            var res, paths, i, p, basePath, fullPath, stat, data;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            res = null;
                            paths = this.searchPaths;

                            if (name) {
                                _context2.next = 4;
                                break;
                            }

                            throw new Error('The `name` parameter is not specified: ' + name);

                        case 4:
                            i = 0;

                        case 5:
                            if (!(i < paths.length)) {
                                _context2.next = 29;
                                break;
                            }

                            p = paths[i];
                            basePath = _path2.default.resolve(p);
                            fullPath = _path2.default.resolve(p, name);

                            if (!(fullPath.indexOf(basePath) === 0)) {
                                _context2.next = 26;
                                break;
                            }

                            _context2.prev = 10;
                            _context2.next = 13;
                            return fsStat(fullPath);

                        case 13:
                            stat = _context2.sent;
                            _context2.next = 19;
                            break;

                        case 16:
                            _context2.prev = 16;
                            _context2.t0 = _context2['catch'](10);

                            stat = null;

                        case 19:
                            if (!(stat && stat.isFile())) {
                                _context2.next = 26;
                                break;
                            }

                            _context2.next = 22;
                            return fsReadFile(fullPath, 'utf-8');

                        case 22:
                            data = _context2.sent;

                            res = { src: data, path: fullPath, noCache: this.noCache };
                            this.pathsToNames[fullPath] = name;
                            return _context2.abrupt('break', 29);

                        case 26:
                            i++;
                            _context2.next = 5;
                            break;

                        case 29:
                            return _context2.abrupt('return', res);

                        case 30:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this, [[10, 16]]);
        }));

        function getSourceAsync(_x2) {
            return ref.apply(this, arguments);
        }

        return getSourceAsync;
    }(),

    getSource: function getSource(name, cb) {
        this.getSourceAsync(name).then(function (res) {
            cb(null, res);
        }).catch(cb);
    }
});

exports.default = FileSystemAsyncLoader;