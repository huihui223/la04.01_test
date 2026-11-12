import { readFile, writeFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const file = join(root, 'package.json');
const pkg = JSON.parse(await readFile(file, 'utf8'));
if (pkg.name !== 'la-agentdocs-install-test') throw new Error('Not the local installation fixture');
for (const key of ['dependencies', 'devDependencies', 'optionalDependencies']) {
  if (Object.keys(pkg[key] ?? {}).some(name => name !== '@agentdoc/cli')) {
    throw new Error('Other dependencies exist; reset manually to preserve them');
  }
}
// switch refuses to overwrite conflicting tracked edits; never reset/clean the source.
execFileSync('git', ['switch', 'main'], { cwd: join(root, 'framework'), stdio: 'inherit' });
for (const path of ['node_modules/@agentdoc/cli', 'node_modules/.bin/agentdocs',
  'node_modules/.package-lock.json', 'package-lock.json',
  'framework/@agentdoc/cli/node_modules', 'framework/@agentdoc/cli/package-lock.json']) {
  await rm(join(root, path), { force: true, recursive: true });
}
for (const key of ['dependencies', 'devDependencies', 'optionalDependencies']) {
  if (!pkg[key]) continue;
  delete pkg[key]['@agentdoc/cli'];
  if (!Object.keys(pkg[key]).length) delete pkg[key];
}
await writeFile(file, JSON.stringify(pkg, null, 2) + '\n');
console.log('Ready: main without CLI source, project CLI uninstalled. Start a NEW Kimi session to test.');
