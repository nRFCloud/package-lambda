#!/usr/bin/env node

const { spawn } = require('child_process');
const { readFile: readFileAsync } = require('fs');
const { promisify } = require('util');
const readFile = promisify(readFileAsync);
const downloadNpmPackage = require('download-npm-package');
const tmp = require('tmp');
const path = require('path');
const ncpAsync = require('ncp').ncp;
const ncp = promisify(ncpAsync);
const chalk = require('chalk');
const program = require('commander');
const semver = require('semver');

const run = (cmd, args, options) => new Promise(((resolve, reject) => {
  console.log(`${chalk.grey('running:')} ${chalk.yellow(cmd)} ${chalk.yellow(args.join(' '))} ${chalk.grey('...')}`);
  const p = spawn(cmd, args, options);
  let stdout = [];
  let stderr = [];

  p.stdout.on('data', data => {
    process.stdout.write(chalk.magenta(data.toString()));
    stdout.push(data.toString());
  });

  p.stderr.on('data', data => {
    process.stderr.write(chalk.red(data.toString()));
    stderr.push(data.toString());
  });

  p.on('close', code => {
    if (code !== 0) return reject(new Error(`${cmd} exited with code ${code}.\n${stderr.join('\n')}`));
    return resolve({ code, stdout: stdout.join('\n'), stderr: stderr.join('\n') })
  });
}));

const createTempDir = () => new Promise((resolve, reject) => {
  tmp
    .dir(async (err, tempDir) => {
      if (err) return reject(err);
      console.log(`${chalk.gray('Temp dir:')} ${chalk.yellow(tempDir)}`);
      resolve(tempDir);
    }, { unsafeCleanup: false });
});

const publishToS3 = async (name, version, tempDir, bucket, env) => {
  const zipFileName = `${name.split('/')[1] || name}-${version}.zip`;
  const zipFile = `${tempDir}/${zipFileName}`;
  await run('zip', ['-r', '-q', `${zipFile}`, './'], { cwd: tempDir });
  await run('aws', ['s3', 'cp', zipFile, `s3://${bucket}/${zipFileName}`], { env: process.env });
};

const npm = async (packageName, bucket) => createTempDir()
  .then(async tempDir => {
    await downloadNpmPackage({
      arg: packageName,
      dir: tempDir
    });
    await ncp(path.join(tempDir, ...packageName.split('/')), tempDir)
    await run('rm', ['-r', path.join(tempDir, packageName.split('/')[0])], { cwd: tempDir });
    const { name, version } = JSON.parse(await readFile(path.join(tempDir, 'package.json')), 'utf-8');

    console.log(`${chalk.blue(name)} ${chalk.green(version)}`);
    await run('npm', ['ci', '--ignore-scripts', '--only=prod'], { cwd: tempDir });
    await publishToS3(name, version, tempDir, bucket)
  });

const local = async (bucket) => createTempDir()
  .then(async tempDir => {
    const pkg = path.join(process.env.PWD, 'package.json');
    const { name, version } = JSON.parse(await readFile(pkg), 'utf-8');
    const now = Date.now();
    console.log(`${chalk.blue(name)} ${chalk.green(version)} ${chalk.magenta(now)}`);
    try {
      await ncp(pkg, path.join(tempDir, 'package.json'));
      await ncp(path.join(process.env.PWD, 'package-lock.json'), path.join(tempDir, 'package-lock.json'));
      await ncp(path.join(process.env.PWD, 'dist'), path.join(tempDir, 'dist'));
      await run('npm', ['ci', '--ignore-scripts', '--only=prod'], { cwd: tempDir });
      await publishToS3(name, `${semver.major(version)}.${semver.minor(version)}.${semver.patch(version)}-development.${now}`, tempDir, bucket)
    } catch (err) {
      console.error(err);
    }
  });

program
  .command('npm <packageName> <bucket>')
  .action(async (packageName, bucket) => {
    await npm(packageName, bucket)
  });

program
  .command('local <bucket>')
  .action(async (bucket) => {
    await local(bucket)
  });

program.parse(process.argv);
