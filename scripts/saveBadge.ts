import * as fs from 'node:fs';
import * as path from 'node:path';

import { makeBadge } from 'badge-maker';

export function saveBadge(options: { fileName: string; label: string; message: string }) {
  const { fileName, label, message } = options;

  const assetsPath = path.resolve(process.cwd(), 'assets');
  const svgPath = path.resolve(assetsPath, fileName);

  if (!fs.existsSync(assetsPath)) fs.mkdirSync(assetsPath);

  const svgNew = makeBadge({ label, message, color: 'brightgreen' });
  const svgOld = fs.existsSync(svgPath) ? fs.readFileSync(svgPath, 'utf-8') : null;

  if (svgOld) {
    const messageOld = svgOld.match(/>(\d+\.?(\d+)?\s[\w%]+)</)?.[1];

    if (message === messageOld) {
      console.log(`(unchanged) ${fileName} ${messageOld}`);

      return;
    }

    console.log(`(changed) ${fileName} changed from ${messageOld} to ${message}`);
  } else {
    console.log(`(new) ${fileName} ${message}`);
  }

  fs.writeFileSync(path.resolve(svgPath), svgNew, 'utf-8');
}
