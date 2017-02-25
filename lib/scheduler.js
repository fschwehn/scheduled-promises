"use strict"

const log = console.log
  , Job = require('./job')
  , _ = require('underscore')

class Scheduler {
  constructor(opts) {
    this._id2job = {}
  }
  
  * [Symbol.iterator]() {
    for (const id in this._id2job) {
      yield this._id2job[id]
    }
  }
  
  get jobs() {
    return _.values(this._id2job)
  }
  
  addJob(job) {
    if (!(job instanceof Job)) 
      job = new Job(job)
    
    const id = job.id
    
    if (this._id2job[id])
      throw new Error(`Job with id '${id}' already exists!`)
    
    this._id2job[id] = job
    this.scheduleNextJob()
    
    return this
  }
  
  job(id) {
    return this._id2job[id]
  }
  
  scheduleNextJob() {
    clearTimeout(this._timer)
    
    if (!this.jobs.length)
      return Promise.resolve()
    
    return Promise.all(this.jobs.map(j => j.restore()))
      .then(jobs => {
        const launchInfos = jobs.map(j => {
          return {
            job: j,
            date: j.nextLaunchDate()
          }
        })
        
        const nextLauchInfo = _.min(launchInfos, 'date')
        
        if (!(nextLauchInfo.date instanceof Date))
          return
        
        const time = Math.max(0, nextLauchInfo.date.valueOf() - new Date().valueOf())
        
        this._timer = setTimeout(() => {
          nextLauchInfo.job
            .launch()
            .then(results => {
              this.scheduleNextJob()
            })
            .catch(err => {
              console.error(err)
              this.scheduleNextJob()
            })
        }, time)
      })
      .catch(err => console.log(err.stack))
  }
  
  launchJob(id) {
    const job = this.job(id)
    return job ? Promise.resolve() : job.launch()
  }
}

module.exports = Scheduler
