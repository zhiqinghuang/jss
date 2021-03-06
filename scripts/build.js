const fs = require('fs')
const path = require('path')
const shell = require('shelljs')

function getCommand() {
  const rollup = path.join(__dirname, '../node_modules/.bin/rollup')
  const args = ['--config "../../rollup.config.js"']

  return `${rollup} ${args.join(' ')}`
}

function handleExit(code, errorCallback) {
  if (code !== 0) {
    if (errorCallback && typeof errorCallback === 'function') {
      errorCallback()
    }

    shell.exit(code)
  }
}

function build(options = {}) {
  const {silent = false, errorCallback} = options

  if (!fs.existsSync('src')) {
    if (!silent) {
      console.error('No src dir')
    }

    return
  }

  const command = getCommand()
  const {code} = shell.exec(command, {silent})

  handleExit(code, errorCallback)
}

module.exports = {build}
