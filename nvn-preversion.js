#!/usr/bin/env node

const nvn = require('./index')

nvn.preversion()
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
