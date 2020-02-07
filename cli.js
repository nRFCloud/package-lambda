#!/usr/bin/env node
'use strict'

const program = require('commander')
const { local } = require('./index')

function commaSeparatedList(value, dummyPrevious) {
  return value.split(',');
}

program
  .command('local <bucket>')
  .option('-s, --source <directory>', 'Source location', process.env.PWD)
  .option('-l, --layer', 'Source tree is a Lambda layer. Package the tree as-is. ' +
    'Do not install it as an npm package. A package.json is required but only for the name and version.')
  .option('--script-install <packages>', 'Run "npm install --only=prod" on the comma-delimited list of ' +
    'packages, which runs scripts in their package.json. All scripts in all other packages are ignored.', commaSeparatedList)
  .option('--always-upload', 'Always upload files even if they already exist on S3.')
  .action(async (bucket, { source, layer, scriptInstall, alwaysUpload }) => {
    process.stdout.write(await local(bucket, source, layer, scriptInstall, alwaysUpload))
  })

program.parse(process.argv)
