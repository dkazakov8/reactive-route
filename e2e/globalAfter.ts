import fs from 'node:fs';
import path from 'node:path';

export default function globalAfter() {
  fs.readdirSync(path.resolve('examples')).map((project) =>
    fs
      .readdirSync(path.resolve('examples', project))
      .filter((folderName) => folderName.startsWith('dist'))
      .map((folderName) => path.resolve('examples', project, folderName))
      .forEach((folderPath) => fs.rmSync(folderPath, { recursive: true, force: true }))
  );
}
