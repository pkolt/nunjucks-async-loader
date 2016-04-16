var path = require('path');
var nunjucks = require('nunjucks');
var nunjucksAsyncLoader = require('../index');

describe('get source template', function() {
    var loader = null;
    var templateDir = __dirname + '/templates';

    beforeEach(function() {
        loader = new nunjucksAsyncLoader(templateDir);
    });

    afterEach(function() {
        loader = null;
    });

    it('get source base.html', function(done) {
        loader.getSource('base.html', function(err, res) {
            if (err) return done.fail(err);
            expect(res.src).toMatch('<!-- template: base.html -->');
            expect(res.path).toEqual(path.join(templateDir, 'base.html'));
            done();
        });
    });

    it('get source index.html', function() {
        loader.getSource('index.html', function(err, res) {
            if (err) return done.fail(err);
            expect(res.src).toMatch('<!-- template: base.html -->');
            expect(res.src).toMatch('<!-- template: index.html -->');
            expect(res.path).toEqual(path.join(templateDir, 'index.html'));
            done();
        });
    });
});