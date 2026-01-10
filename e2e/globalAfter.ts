import fs from 'node:fs';
import path from 'node:path';

export default function globalAfter() {
  const createdFolders: Array<string> = [];

  fs.readdirSync(path.resolve('examples')).map((project) =>
    fs
      .readdirSync(path.resolve('examples', project))
      .filter((folderName) => folderName.startsWith('dist'))
      .map((folderName) => {
        createdFolders.push(`${project}/${folderName}`);

        return path.resolve('examples', project, folderName);
      })
      .forEach((folderPath) => fs.rmSync(folderPath, { recursive: true, force: true }))
  );

  console.log(`\x1b[32m[e2e]\x1b[0m folders cleanup \x1b[33m${createdFolders.join(', ')}\x1b[0m`);
}
