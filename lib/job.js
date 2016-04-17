"use strict"

const log = console.log
    , _ = require('underscore')

class Job {
  constructor(opts) {
    opts = _.extend({}, opts)
    
    this.id = opts.id || Job.nextId()
    this.makePromise = opts.makePromise instanceof Function ? opts.makePromise : () => Promise.resolve()
  }
  
  static nextId() {
    return this._nextId++
  }
  
  nextLaunchDate() {
    return new Date(new Date().valueOf() + 1200)
  }
  
  launch() {
    return this.makePromise()
  }
}

Job._nextId = 0

module.exports = Job