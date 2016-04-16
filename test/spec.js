var path = require('path');
var nunjucks = require('nunjucks');
var nunjucksAsyncLoader = require('../index');

describe('get source template', function() {
    var loader = null;
    var baseDir = __dirname + '/templates';
    var appDir = __dirname + '/app/templates';

    beforeEach(function() {
        loader = new nunjucksAsyncLoader([baseDir, appDir]);
    });

    afterEach(function() {
        loader = null;
    });

    it('get source base.html', function(done) {
        loader.getSource('base.html', function(err, res) {
            if (err) return done.fail(err);
            expect(res.src).toMatch('<!-- template: base.html -->');
            expect(res.path).toEqual(path.join(baseDir, 'base.html'));
            done();
        });
    });

    it('get source index.html', function(done) {
        loader.getSource('index.html', function(err, res) {
            if (err) return done.fail(err);
            expect(res.src).toMatch('<!-- template: index.html -->');
            expect(res.path).toEqual(path.join(appDir, 'index.html'));
            done();
        });
    });
});