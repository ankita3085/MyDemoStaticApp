const fs = require('fs');
const path = require('path');

const root = process.cwd();
const out = path.join(root, 'build');

const includeExtensions = new Set(['.html', '.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.json', '.pdf', '.docx']);
const includeDirs = new Set(['css', 'images', 'img', 'data']);
const excludeTop = new Set(['node_modules', '.git', '.github', 'scripts', 'build']);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function shouldInclude(filePath) {
  const rel = path.relative(root, filePath);
  if (!rel) return false;
  const parts = rel.split(path.sep);
  if (excludeTop.has(parts[0])) return false;
  const ext = path.extname(filePath).toLowerCase();
  if (includeExtensions.has(ext)) return true;
  if (parts.some(p => includeDirs.has(p))) return true;
  return false;
}

function walkAndCopy(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const srcPath = path.join(dir, it.name);
    const rel = path.relative(root, srcPath);
    if (excludeTop.has(rel.split(path.sep)[0])) continue;
    if (it.isDirectory()) {
      walkAndCopy(srcPath);
    } else if (it.isFile()) {
      if (shouldInclude(srcPath)) {
        const dest = path.join(out, rel);
        copyFile(srcPath, dest);
      }
    }
  }
}

// clean
if (fs.existsSync(out)) {
  fs.rmSync(out, { recursive: true, force: true });
}
ensureDir(out);

// copy selected files
walkAndCopy(root);

// create simple index if none exists
if (!fs.existsSync(path.join(out, 'index.html')) && fs.existsSync(path.join(root, 'index.html'))) {
  copyFile(path.join(root, 'index.html'), path.join(out, 'index.html'));
}

console.log('Static build completed. Output ->', out);
