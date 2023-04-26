import { readFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import { Loader, type LoaderSource, type LoaderOptions, type Callback } from 'nunjucks';
import chokidar, { type FSWatcher } from 'chokidar';

export class FileSystemAsyncLoader extends Loader {
  async = true;
  pathsToNames: Record<string, string> = {};
  searchPaths: string[] = [];
  noCache: boolean;
  fsWatcher?: FSWatcher;

  constructor(searchPaths: string[] | string, opts?: LoaderOptions) {
    super();
    const config = opts ?? {};

    if (searchPaths) {
      searchPaths = Array.isArray(searchPaths) ? searchPaths : [searchPaths];
      searchPaths = searchPaths.map(path.normalize);
    } else {
      searchPaths = ['.'];
    }

    this.searchPaths = searchPaths;
    this.noCache = !!config.noCache;

    if (config.watch) {
      this.watchDirs(searchPaths).catch(console.error);
    }
  }

  async watchDirs(searchPaths: string[]) {
    const paths: string[] = [];

    for (const p of searchPaths) {
      const fullPath = path.resolve(p);
      try {
        const stat = await lstat(fullPath);
        if (stat.isDirectory()) {
          paths.push(fullPath);
        }
      } catch (err) {
        // ...
      }
    }

    const watcher = chokidar.watch(paths);

    watcher.on('all', (event, fullPath) => {
      fullPath = path.resolve(fullPath);
      if (event === 'change' && fullPath in this.pathsToNames) {
        this.emit('update', this.pathsToNames[fullPath]);
      }
    });

    watcher.on('error', (err) => {
      console.error('Watcher error: ' + err);
    });

    this.fsWatcher = watcher;
  }

  async getSourceAsync(name: string): Promise<LoaderSource> {
    let res: LoaderSource | null = null;

    for (const p of this.searchPaths) {
      const basePath = path.resolve(p);
      const fullPath = path.resolve(p, name);
      if (fullPath.startsWith(basePath)) {
        try {
          const stat = await lstat(fullPath);
          if (stat && stat.isFile()) {
            const data = await readFile(fullPath, 'utf-8');
            res = { src: data, path: fullPath, noCache: this.noCache };
            this.pathsToNames[fullPath] = name;
            break;
          }
        } catch (err) {
          // ...
        }
      }
    }

    if (!res) {
      throw new Error(`Not found template "${name}".`);
    }

    return res;
  }

  async destroy() {
    if (this.fsWatcher) {
      await this.fsWatcher.close();
    }
  }

  getSource(name: string, callback: Callback<Error, LoaderSource>) {
    this.getSourceAsync(name)
      .then((res) => {
        callback(null, res);
      })
      .catch((err) => callback(err, null));
  }
}

export default FileSystemAsyncLoader;
