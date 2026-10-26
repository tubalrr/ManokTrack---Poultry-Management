import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const zip = new JSZip();

const exclude = new Set([
  'node_modules',
  '.git',
  'dist',
  '.cache',
  'public',
]);

function addFolderToZip(folderPath, currentZip) {
  const items = fs.readdirSync(folderPath);
  for (const item of items) {
    if (exclude.has(item)) continue;
    const itemPath = path.join(folderPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      const nestedZip = currentZip.folder(item);
      addFolderToZip(itemPath, nestedZip);
    } else {
      currentZip.file(item, fs.readFileSync(itemPath));
    }
  }
}

async function main() {
  addFolderToZip('.', zip);
  fs.mkdirSync('public', { recursive: true });
  const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync('public/manoktrack-project.zip', content);
  console.log('Successfully generated public/manoktrack-project.zip (' + content.length + ' bytes)');
}

main().catch(console.error);
