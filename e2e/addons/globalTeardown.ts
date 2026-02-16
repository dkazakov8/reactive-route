import fs from 'node:fs';
import path from 'node:path';

export default function globalTeardown() {
  const examplesPath = path.resolve('examples');
  const createdFolders = fs.globSync('examples/*/dist*/').map((folderPath) => {
    fs.rmSync(folderPath, { recursive: true, force: true });

    return path.relative(examplesPath, folderPath);
  });

  console.log(`\x1b[32m[e2e]\x1b[0m folders cleanup \x1b[33m${createdFolders.join(', ')}\x1b[0m`);
}
