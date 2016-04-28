'use strict';

const test = require('ava');
const fs = require('fs');
const path = require('path');
const promisify  = require('es6-promisify');
const nunjucksAsyncLoader = require('../index');


const fsStat = promisify(fs.stat);
const fsUnlink = promisify(fs.unlink);
const fsWriteFile = promisify(fs.writeFile);

const BASE_DIR = path.join(__dirname, 'templates');

var loader = null;
var getSource = null;
var filename = 'watch.html';
var fullPath = path.join(BASE_DIR, filename);
var fileText = 'i am simple file';


test.beforeEach(async t => {
    await fsWriteFile(fullPath, fileText, 'utf-8');
    loader = new nunjucksAsyncLoader(BASE_DIR, {watch: true});
    getSource = promisify(loader.getSource.bind(loader));
});

test.afterEach(async t => {
    var stat;
    try {
        stat = await fsStat(fullPath);
    } catch (err) {
        stat = null;
    }

    if (stat && stat.isFile()) {
        // Delete file.
        await fsUnlink(fullPath);
    }

    loader = null;
    getSource = null;
});

test('update template after change', async t => {
    var res = await getSource(filename);
    t.is(res.path, fullPath);
    t.is(res.src, fileText);

    await fsWriteFile(fullPath, 'i am changed file', 'utf-8');
    res = await getSource(filename);
    t.is(res.path, fullPath);
    t.is(res.src, 'i am changed file');
});
