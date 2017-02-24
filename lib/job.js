"use strict"

const log = console.log
    , _ = require('underscore')

class Job {
  constructor(opts) {
    opts = _.extend({
      launchInterval: 1000,
      makePromise: () => Promise.resolve()
    }, opts)
    
    this.id = opts.id || Job.nextId()
    this.launchInterval = opts.launchInterval
    this.makePromise = opts.makePromise
    this.paused = !!opts.paused
    this.lastLaunchDate = opts.lastLaunchDate
  }
  
  static nextId() {
    return this._nextId++
  }
  
  nextLaunchDate() {
    if (this.paused)
      return null
    
    const lastLaunchDate = this.lastLaunchDate

    if (lastLaunchDate instanceof Date)
      return new Date(lastLaunchDate.valueOf() + this.launchInterval)
    
    return new Date()
  }
  
  launch() {
    this.lastLaunchDate = new Date()
    return this.makePromise()
  }
}

Job._nextId = 0

module.exports = Job
