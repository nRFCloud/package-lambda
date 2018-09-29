#!/usr/bin/env node

const {spawn} = require('child_process')
const {readFile: readFileAsync} = require('fs')
const {promisify} = require('util')
const readFile = promisify(readFileAsync)
const tmp = require('tmp')
const path = require('path')
const ncpAsync = require('ncp').ncp
const ncp = promisify(ncpAsync)
const chalk = require('chalk')
const program = require('commander')
const {S3} = require('aws-sdk')

const run = (cmd, args, options) => new Promise((resolve, reject) => {
  console.error(`${chalk.grey('running:')} ${chalk.yellow(cmd)} ${chalk.yellow(args.join(' '))} ${chalk.grey('...')}`)
  const p = spawn(cmd, args, options)
  let stdout = []
  let stderr = []

  p.stdout.on('data', data => {
    process.stdout.write(chalk.magenta(data.toString()))
    stdout.push(data.toString())
  })

  p.stderr.on('data', data => {
    process.stderr.write(chalk.red(data.toString()))
    stderr.push(data.toString())
  })

  p.on('close', code => {
    if (code !== 0) return reject(new Error(`${cmd} exited with code ${code}.\n${stderr.join('\n')}`))
    return resolve({code, stdout: stdout.join('\n'), stderr: stderr.join('\n')})
  })
})

const createTempDir = () => new Promise((resolve, reject) => {
  tmp
    .dir(async (err, tempDir) => {
      if (err) return reject(err)
      console.error(`${chalk.gray('Temp dir:')} ${chalk.yellow(tempDir)}`)
      resolve(tempDir)
    }, {unsafeCleanup: false})
})

const publishToS3 = async (zipFileName, tempDir, bucket) => {
  const zipFile = `${tempDir}/${zipFileName}`
  await run('zip', ['-r', '-q', `${zipFile}`, './'], {cwd: tempDir})
  const zipData = await readFile(zipFile)
  const s3 = new S3()
  return s3.putObject({Body: zipData, Bucket: bucket, Key: zipFileName}).promise()
}

const existsOnS3 = async (zipFileName, bucket) => {
  const s3 = new S3()
  return s3
    .headObject({
      Bucket: bucket, Key: zipFileName
    })
    .promise()
    .then(() => true)
    .catch(() => false)
}

const local = async (bucket, sourcefolder) => createTempDir()
  .then(async tempDir => {
    const pkg = path.join(sourcefolder, 'package.json')
    const {name, version} = JSON.parse(await readFile(pkg), 'utf-8')
    console.error(`${chalk.blue(name)} ${chalk.green(version)}`)
    const zipFileName = `${name.split('/')[1] || name}-${version}.zip`
    if (await existsOnS3(zipFileName, bucket)) {
      console.error(chalk.yellow(`s3://${bucket}/${zipFileName} exists`))
      return zipFileName
    }
    try {
      await ncp(pkg, path.join(tempDir, 'package.json'))
      await ncp(path.join(sourcefolder, 'package-lock.json'), path.join(tempDir, 'package-lock.json'))
      await ncp(path.join(sourcefolder, 'dist'), path.join(tempDir, 'dist'))
      await run('npm', ['ci', '--ignore-scripts', '--only=prod'], {cwd: tempDir})
      console.error(`${chalk.gray('Uploading to S3:')} ${chalk.yellow(bucket)}${chalk.gray('/')}${chalk.yellow(zipFileName)}`)
      await publishToS3(zipFileName, tempDir, bucket)
      return zipFileName
    } catch (err) {
      console.error(err)
    }
  })

program
  .command('local <bucket>')
  .option('-s, --source <directory>', 'Source location', process.env.PWD)
  .action(async (bucket, {source}) => {
    process.stdout.write(await local(bucket, source))
  })

program.parse(process.argv)
