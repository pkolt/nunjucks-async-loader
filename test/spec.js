var co = require('co');
var fs = require('fs');
var path = require('path');
var promisify = require('es6-promisify');
var nunjucks = require('nunjucks');
var nunjucksAsyncLoader = require('../index');

var fsStat = promisify(fs.stat);
var fsUnlink = promisify(fs.unlink);
var fsWriteFile = promisify(fs.writeFile);

var BASE_DIR = __dirname + '/templates';
var APP_DIR = __dirname + '/app/templates';


describe('get source template', function() {
    var loader = null;
    var getSource = null;

    beforeEach(function() {
        loader = new nunjucksAsyncLoader([BASE_DIR, APP_DIR]);
        getSource = promisify(loader.getSource.bind(loader));
    });

    afterEach(function() {
        loader = null;
        getSource = null;
    });

    it('get source base.html', function(done) {
        co(function*() {
            var res = yield getSource('base.html');
            expect(res.src).toMatch('<!-- template: base.html -->');
            expect(res.path).toEqual(path.join(BASE_DIR, 'base.html'));
        }).then(done).catch(done.fail);
    });

    it('get source index.html', function(done) {
        co(function*() {
            var res = yield getSource('index.html');
            expect(res.src).toMatch('<!-- template: index.html -->');
            expect(res.path).toEqual(path.join(APP_DIR, 'index.html'));
        }).then(done).catch(done.fail);
    });
});


describe('watch and update template', function() {
    var loader = null;
    var getSource = null;

    var filename = 'watch.html';
    var fullPath = path.join(BASE_DIR, filename);
    var fileText = 'i am simple file';

    beforeEach(function(done) {
        co(function*() {
            yield fsWriteFile(fullPath, fileText, 'utf-8');
            loader = new nunjucksAsyncLoader(BASE_DIR, {watch: true});
            getSource = promisify(loader.getSource.bind(loader));
        }).then(done).catch(done.fail);
    });

    afterEach(function(done) {
        co(function*() {
            var stat;
            try {
                stat = yield fsStat(fullPath);
            } catch (err) {
                stat = null;
            }

            if (stat && stat.isFile()) {
                // Delete file.
                yield fsUnlink(fullPath);
            }

            loader = null;
            getSource = null;
        }).then(done).catch(done.fail);
    });

    it('update template after change', function(done) {
        co(function*() {
            var res = yield getSource(filename);
            expect(res.path).toEqual(fullPath);
            expect(res.src).toEqual(fileText);

            yield fsWriteFile(fullPath, 'i am changed file', 'utf-8');
            res = yield getSource(filename);
            expect(res.path).toEqual(fullPath);
            expect(res.src).toEqual('i am changed file');
        }).then(done).catch(done.fail);
    });
});
