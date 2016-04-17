"use strict"

const package = require('../index')
    , Scheduler = package.Scheduler
    , Job = package.Job
    , log = console.log

const scheduler = new Scheduler()

scheduler.addJob({
  // promise: () => new Promise((resolve, reject) => {
  //   log('started promise...')
  //   setTimeout(() => {
  //     resolve(42)
  //   }, 2000)
  // })
})

log(scheduler.jobs)