import path from 'node:path';
import { lstat, unlink, writeFile } from 'node:fs/promises';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { promisify } from 'node:util';
import { FileSystemAsyncLoader } from './index.js';
import { type LoaderSource } from 'nunjucks';

const TEST_DIR = path.join(import.meta.dirname, './test');
const BASE_DIR = path.join(TEST_DIR, 'templates');
const APP_DIR = path.join(TEST_DIR, 'app/templates');

type GetSourceFn = (name: string) => Promise<LoaderSource>;

describe('test get source', () => {
  let loader: FileSystemAsyncLoader;
  let getSource: GetSourceFn;

  beforeEach(() => {
    loader = new FileSystemAsyncLoader([BASE_DIR, APP_DIR]);
    getSource = promisify(loader.getSource).bind(loader) as GetSourceFn;
  });

  afterEach(async () => {
    await loader.destroy();
  });

  it('get source base.html', async () => {
    const res = await getSource('base.html');
    assert.ok(res.src.includes('<!-- template: base.html -->'));
    assert.equal(res.path, path.join(BASE_DIR, 'base.html'));
  });

  it('get source index.html', async () => {
    const res = await getSource('index.html');
    assert.ok(res.src.includes('<!-- template: index.html -->'));
    assert.equal(res.path, path.join(APP_DIR, 'index.html'));
  });
});

describe('test watch', () => {
  let loader: FileSystemAsyncLoader;
  let getSource: GetSourceFn;
  let filename = 'watch.html';
  let fullPath = path.join(BASE_DIR, filename);
  let fileText = 'i am simple file';

  beforeEach(async () => {
    await writeFile(fullPath, fileText, 'utf-8');
    loader = new FileSystemAsyncLoader(BASE_DIR, { watch: true });
    getSource = promisify(loader.getSource).bind(loader) as GetSourceFn;
  });

  afterEach(async () => {
    await loader.destroy();
    try {
      const stat = await lstat(fullPath);
      if (stat.isFile()) {
        // Delete file.
        await unlink(fullPath);
      }
    } catch (err) {
      // ...
    }
  });

  it('update template after change', async () => {
    let res = await getSource(filename);
    assert.equal(res.path, fullPath);
    assert.equal(res.src, fileText);

    await writeFile(fullPath, 'i am changed file', 'utf-8');
    res = await getSource(filename);
    assert.equal(res.path, fullPath);
    assert.equal(res.src, 'i am changed file');
  });
});
