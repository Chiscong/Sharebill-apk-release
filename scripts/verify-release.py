import hashlib
import json
import os
from pathlib import Path
import zipfile

repository = Path(__file__).resolve().parents[1]
artifacts = repository / 'artifacts'
apk = artifacts / 'sharebill-release.apk'
manifest = json.loads((artifacts / 'release.json').read_text())
tag = os.environ.get('RELEASE_TAG', f"v{manifest['version']}")

if tag != f"v{manifest['version']}":
    raise SystemExit('The tag must match the APK version.')
with apk.open('rb') as stream:
    digest = hashlib.file_digest(stream, 'sha256').hexdigest()
if manifest['sizeBytes'] != apk.stat().st_size or manifest['sha256'] != digest:
    raise SystemExit('The APK does not match release.json.')
if manifest['packageName'] != 'com.example.sharebill':
    raise SystemExit('Unexpected application package.')
with zipfile.ZipFile(apk) as archive:
    if 'AndroidManifest.xml' not in archive.namelist():
        raise SystemExit('An Android APK is required.')
    architectures = sorted({
        name.split('/')[1]
        for name in archive.namelist()
        if name.startswith('lib/') and name.endswith('/libapp.so')
    })
if architectures != sorted(manifest['architectures']):
    raise SystemExit('The APK architectures do not match release.json.')
checksum_line = f'{digest}  sharebill-release.apk\n'
if (artifacts / 'SHA256SUMS').read_text() != checksum_line:
    raise SystemExit('SHA256SUMS does not match the APK.')
print(f"Verified {tag}: {manifest['sizeBytes']} bytes; {', '.join(architectures)}")
