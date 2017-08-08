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
  
  scheduleNextJob(delay) {
    delay = delay || 0
    
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
        
        const time = Math.max(delay, nextLauchInfo.date.valueOf() - new Date().valueOf())
        const nextJobId = nextLauchInfo.job.id

        this._timer = setTimeout(() => this.launchJob(nextJobId), time)
      })
      .catch(err => console.log(err.stack))
  }
  
  launchJob(id) {
    const job = this.job(id)

    if (!job)
      return Promise.reject(Error(`No job found with id '${id}'!`))

    return job.launch()
      .then(result => this.scheduleNextJob(result ? 0 : 5000))
      .catch(err => {
        console.error(err)
        this.scheduleNextJob(5000)
      })
  }
}

module.exports = Scheduler
