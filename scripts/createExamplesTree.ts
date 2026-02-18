import * as fs from 'node:fs';
import * as path from 'node:path';

import { createMarkdownRenderer } from 'vitepress';

export type TypeTreeNode = {
  name: string;
  lang: string;
  isDefault?: boolean;
  content?: string;
  children?: Array<TypeTreeNode>;
};

let md: Awaited<ReturnType<typeof createMarkdownRenderer>>;

const examplesDir = path.resolve('examples');
const outputFilePath = path.resolve('vitepress/tree.json');

async function traverse(
  dir: string,
  framework: string,
  contentMap: Map<string, string>,
  relativeDir = ''
): Promise<Array<TypeTreeNode>> {
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !/(node_modules|dist|\.md)/.test(entry.name));

  const nodes = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name);
      const relativePath = path.posix.join(relativeDir, entry.name);

      if (entry.isDirectory()) {
        return {
          lang: 'folder',
          name: entry.name,
          children: await traverse(entryPath, framework, contentMap, relativePath),
        };
      } else {
        const content = fs.readFileSync(entryPath, 'utf8');
        const lang = path.extname(entry.name).toLowerCase().replace('.', '');
        const renderedContent = await md.renderAsync(`\`\`\`${lang} \n${content}\n\`\`\``);

        const treeNode: TypeTreeNode = {
          lang,
          name: entry.name,
        };

        const fullPath = `${framework}/${relativePath}`;
        if (contentMap.has(renderedContent)) {
          treeNode.content = `linked:${contentMap.get(renderedContent)}`;
        } else {
          contentMap.set(renderedContent, fullPath);
          treeNode.content = renderedContent;
        }

        if (entry.name === 'client.tsx' || entry.name === 'client.ts') {
          treeNode.isDefault = true;
        }

        return treeNode;
      }
    })
  );

  return nodes.sort((a, b) => {
    const aIsDir = Boolean(a.children);
    const bIsDir = Boolean(b.children);

    if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;

    return a.name.localeCompare(b.name);
  });
}

export async function createExamplesTree() {
  md = await createMarkdownRenderer(process.cwd(), {
    theme: 'github-dark',
    languages: ['ts', 'tsx', 'js', 'jsx', 'vue', 'css', 'html', 'json'],
  });

  const frameworks = fs
    .readdirSync(examplesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const tree: Record<string, Array<TypeTreeNode>> = {};
  const contentMap = new Map<string, string>();

  for (const framework of frameworks) {
    tree[framework] = await traverse(path.join(examplesDir, framework), framework, contentMap);
  }

  const prevSize = (
    (fs.existsSync(outputFilePath) ? fs.statSync(outputFilePath).size : 0) / 1024
  ).toFixed(2);

  fs.writeFileSync(outputFilePath, `${JSON.stringify(tree, null, 2)}\n`, 'utf8');

  const size = (
    (fs.existsSync(outputFilePath) ? fs.statSync(outputFilePath).size : 0) / 1024
  ).toFixed(2);

  const logPrefix = '\x1b[32m[tree]\x1b[0m';

  if (prevSize === size) {
    console.log(`${logPrefix} unchanged size \x1b[33m${prevSize}kb\x1b[0m`);
  } else {
    console.log(
      `${logPrefix} changed size \x1b[33m${prevSize}kb\x1b[0m -> \x1b[33m${size}kb\x1b[0m`
    );
  }
}
