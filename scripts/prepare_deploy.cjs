const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../demo');
const destDir = path.resolve(__dirname, '../.deploy_temp');

// 1. Clean destination
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}
fs.mkdirSync(destDir, { recursive: true });

// 2. Helper to copy folder recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 3. Do copy
console.log('Copying demo to .deploy_temp...');
copyDir(srcDir, destDir);

// 4. Remove js folder
const jsDir = path.join(destDir, 'js');
if (fs.existsSync(jsDir)) {
  console.log('Removing .deploy_temp/js folder...');
  fs.rmSync(jsDir, { recursive: true, force: true });
}

// 5. Transform imports in js and html files
const ESM_BASE = 'https://esm.sh/view-transitions-toolkit';

function processFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      processFiles(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.html'))) {
      let content = fs.readFileSync(fullPath, 'utf8');

      if (entry.name === 'index.html') {
        const gaSnippet = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-754F24EHD8" fetchpriority="low"></script> <script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "G-754F24EHD8");
</script>`;
        content = content.replace('</body>', `${gaSnippet}\n</body>`);
      }

      // Replace patterns: "../js/animations.js" or "../../js/navigation.js" etc.
      // This matches both single and double quotes, and allows dots for relative path (../js/ or ../../js/ or js/)
      content = content.replace(/(['"])(?:\.{1,2}\/)+js\/([a-zA-Z0-9_-]+)\.js\1/g, (match, quote, filename) => {
        return `${quote}${ESM_BASE}/${filename}${quote}`;
      });

      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Transformed: ${path.relative(destDir, fullPath)}`);
    }
  }
}

console.log('Transforming imports...');
processFiles(destDir);
console.log('Done preparing deploy directory!');
