'use strict';

import test from 'ava';
import path from 'path';
import promisify from 'es6-promisify';
import nunjucksAsyncLoader from '../lib/index';


var BASE_DIR = path.join(__dirname, 'templates');
var APP_DIR = path.join(__dirname, 'app/templates');

var loader = null;
var getSource = null;

test.beforeEach(t => {
    loader = new nunjucksAsyncLoader([BASE_DIR, APP_DIR]);
    getSource = promisify(loader.getSource.bind(loader));
});

test.afterEach(t => {
    loader = null;
    getSource = null;
});

test('get source base.html', async t => {
    var res = await getSource('base.html');
    t.true(res.src.includes('<!-- template: base.html -->'));
    t.is(res.path, path.join(BASE_DIR, 'base.html'));
});

test('get source index.html', async t => {
    var res = await getSource('index.html');
    t.true(res.src.includes('<!-- template: index.html -->'));
    t.is(res.path, path.join(APP_DIR, 'index.html'));
});
