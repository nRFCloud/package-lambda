#!/usr/bin/env node
const program = require('commander')
const { local } = require('./index')

program
  .command('local <bucket>')
  .option('-s, --source <directory>', 'Source location', process.env.PWD)
  .option('-l, --layer', 'Source tree is a Lambda layer. Package the tree as-is. Do not install it as an npm package. A package.json is required but only for the name and version.')
  .action(async (bucket, { source, layer }) => {
    process.stdout.write(await local(bucket, source, layer))
  })

program.parse(process.argv)
