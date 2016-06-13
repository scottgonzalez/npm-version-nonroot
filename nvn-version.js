#!/usr/bin/env node

const nvn = require('./index')

nvn.version()
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
