import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import {
  chmod,
  copyFile,
  mkdir,
  rename,
  stat,
  writeFile,
  rm,
} from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const execute = promisify(execFile);
const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args[index + 1];
};
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const input = option('--file');
if (!input)
  throw new Error(
    'Usage: node scripts/prepare-apk.mjs --file /path/to/app-release.apk --aapt /path/to/Android/Sdk/build-tools/VERSION/aapt',
  );
const source = resolve(input);
const aapt = option('--aapt') || process.env.AAPT_PATH || 'aapt';
const destination = resolve(option('--out') || resolve(repository, 'artifacts'));
await mkdir(destination, { recursive: true });
const temporary = resolve(destination, `.apk-${randomUUID()}`);
const temporaryManifest = `${temporary}.json`;
try {
  // Derive metadata from the staged copy, never from a file still being built.
  await copyFile(source, temporary);
  await chmod(temporary, 0o644);
  const { stdout } = await execute(aapt, ['dump', 'badging', temporary], {
    maxBuffer: 4 * 1024 * 1024,
  });
  const value = (pattern, name) => {
    const match = stdout.match(pattern);
    if (!match) throw new Error(`APK is missing ${name}`);
    return match[1];
  };
  const version = value(/versionName='([^']+)'/, 'versionName');
  const buildNumber = Number(value(/versionCode='(\d+)'/, 'versionCode'));
  const packageName = value(/package: name='([^']+)'/, 'package name');
  const minSdk = Number(value(/^sdkVersion:'(\d+)'/m, 'minSdk'));
  const architectures = [
    ...value(/^native-code:\s*(.+)$/m, 'native architectures').matchAll(
      /'([^']+)'/g,
    ),
  ].map((match) => match[1]);
  const androidVersions = {
    21: '5.0',
    22: '5.1',
    23: '6.0',
    24: '7.0',
    25: '7.1',
    26: '8.0',
    27: '8.1',
    28: '9',
    29: '10',
    30: '11',
    31: '12',
    32: '12.1',
    33: '13',
    34: '14',
    35: '15',
    36: '16',
    37: '17',
  };
  const androidVersion = androidVersions[minSdk];
  if (
    !androidVersion ||
    !architectures.length ||
    !Number.isSafeInteger(buildNumber) ||
    buildNumber < 1
  )
    throw new Error('Unsupported APK release metadata');

  const metadata = await stat(temporary);
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(temporary)) hash.update(chunk);
  const release = {
    version,
    buildNumber,
    packageName,
    minSdk,
    androidVersion,
    architectures,
    sizeBytes: metadata.size,
    sha256: hash.digest('hex'),
    publishedAt: new Date().toISOString(),
  };
  await writeFile(temporaryManifest, JSON.stringify(release, null, 2) + '\n', {
    mode: 0o644,
  });
  await rename(temporary, resolve(destination, 'sharebill-release.apk'));
  // Manifest is replaced last; the server rejects a mismatched pair during replacement.
  await rename(temporaryManifest, resolve(destination, 'release.json'));
  await writeFile(
    resolve(destination, 'SHA256SUMS'),
    `${release.sha256}  sharebill-release.apk\n`,
    { mode: 0o644 },
  );
  console.log(JSON.stringify({ directory: destination, ...release }, null, 2));
} finally {
  await Promise.all([
    rm(temporary, { force: true }),
    rm(temporaryManifest, { force: true }),
  ]);
}
