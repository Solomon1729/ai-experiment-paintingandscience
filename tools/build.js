#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'src', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const content = manifest.fragments
  .map(fragment => fs.readFileSync(path.join(root, 'src', fragment), 'utf8'))
  .join('');
const outputPath = path.join(root, manifest.output);

if (process.argv.includes('--check')) {
  if (!fs.existsSync(outputPath) || !Buffer.from(content).equals(fs.readFileSync(outputPath))) {
    console.error(`OUT_OF_DATE: ${manifest.output} does not match src fragments`);
    process.exitCode = 1;
  } else {
    console.log(`BUILD_MATCH: ${manifest.output}`);
  }
} else {
  fs.writeFileSync(outputPath, content);
  console.log(`BUILT: ${manifest.output}`);
}
