const fs = require('fs');
const path = require('path');

function main() {
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  let v = '';
  try {
    const pkg = require(pkgPath);
    v = String(pkg.version || '');
  } catch (e) {
    console.error('Failed to read package.json version:', e.message);
    process.exitCode = 2;
    return;
  }

  // Write to GITHUB_ENV if present (GitHub Actions runner)
  try {
    if (process.env.GITHUB_ENV && v) {
      fs.appendFileSync(process.env.GITHUB_ENV, `VERSION=${v}\n`);
    }
    // Also write step output if supported
    if (process.env.GITHUB_OUTPUT && v) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=${v}\n`);
    }
  } catch (e) {
    // Don't fail the whole run just because env file isn't writable locally
    console.warn('Could not write to GitHub env/output file:', e.message);
  }

  console.log(v);
}

main();
