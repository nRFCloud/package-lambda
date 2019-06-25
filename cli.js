#!/usr/bin/env node
const program = require('commander')
const { local } = require('./index')

program
  .command('local <bucket>')
  .option('-s, --source <directory>', 'Source location', process.env.PWD)
  .action(async (bucket, { source }) => {
    process.stdout.write(await local(bucket, source))
  })

program.parse(process.argv)
