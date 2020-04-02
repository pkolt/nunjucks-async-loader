'use strict';

const test = require('ava');
const path = require('path');
const promisify  = require('util').promisify;
const nunjucksAsyncLoader = require('../index');


const BASE_DIR = path.join(__dirname, 'templates');
const APP_DIR = path.join(__dirname, 'app/templates');

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
