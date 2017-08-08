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
    this.executing = false
  }
  
  static nextId() {
    return this._nextId++
  }
  
  restore() {
    return Promise.resolve(this)
  }

  save() {
    return Promise.resolve(this)
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
    if (this.executing)
      return Promise.resolve(false)
    
    let self = this
    this.lastLaunchDate = new Date()
    this.executing = true
    
    return this
      .makePromise()
      .then(() => self.save())
      .catch(err => console.error)
      .then(() => {
        this.executing = false
        return true
      })
  }
}

Job._nextId = 0

module.exports = Job
