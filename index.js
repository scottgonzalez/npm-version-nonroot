const exec = require('child_process').execFile
const fs = require('fs')
const path = require('path')

exports.preversion = preversion
exports.version = version

function preversion () {
  return checkStatus()
}

function version () {
  const prefix = process.cwd()
  const packagePath = path.join(prefix, 'package.json')
  const shrinkwrapPath = path.join(prefix, 'npm-shrinkwrap.json')
  const newVersion = process.env.npm_package_version

  const data = { prefix, packagePath, shrinkwrapPath, newVersion }

  return updateShrinkwrap(data)
    .then((hasShrinkwrap) => {
      data.hasShrinkwrap = hasShrinkwrap

      return commit(data)
    })
    .then(() => newVersion)
}

function checkStatus () {
  return gitExec(['status', '--porcelain'])
    .then((stdout) => {
      const lines = cleanStatusLines(stdout)
      if (lines.length && !process.env.npm_config_force) {
        throw new Error('Git working directory not clean.\n' + lines.join('\n'))
      }
    })
}

function cleanStatusLines (stdout) {
  return stdout.trim()
    .split('\n')
    .filter(function (line) {
      return line.trim() && !line.match(/^\?\? /)
    })
    .map(function (line) {
      return line.trim()
    })
}

function updateShrinkwrap (data) {
  return new Promise((resolve, reject) => {
    const shrinkwrapPath = path.join(data.prefix, 'npm-shrinkwrap.json')
    fs.readFile(shrinkwrapPath, (error, shrinkwrap) => {
      if (error) {
        if (error.code === 'ENOENT') {
          return resolve(false)
        }

        return reject(error)
      }

      shrinkwrap = JSON.parse(shrinkwrap)
      shrinkwrap.version = data.newVersion

      fs.writeFile(shrinkwrapPath, JSON.stringify(shrinkwrap, null, 2) + '\n', (error) => {
        if (error) {
          return reject(error)
        }

        resolve(true)
      })
    })
  })
}

function commit (data, callback) {
  const message = process.env.npm_config_message.replace(/%s/g, data.newVersion)
  const sign = process.env.npm_config_sign_git_tag
  const flag = sign ? '-sm' : '-am'
  const tag = process.env.npm_config_tag_version_prefix + data.newVersion

  return gitExec(['add', data.packagePath])
    .then(() => {
      if (!data.hasShrinkwrap) {
        return
      }

      return gitExec(['add', data.shrinkwrapPath])
    })
    .then(() => {
      return gitExec(['commit', '-m', message])
    })
    .then(() => {
      return gitExec(['tag', tag, flag, message])
    })
}

function gitExec (args) {
  return new Promise((resolve, reject) => {
    exec('git', args, { env: process.env }, (error, stdout) => {
      if (error) {
        return reject(error)
      }

      resolve(stdout)
    })
  })
}
