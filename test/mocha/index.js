"use strict"

const pkg = require('../../index')
    , log = console.log
    , assert = require('chai').assert
    
    , Job = pkg.Job
    , Scheduler = pkg.Scheduler

// --------------------------------------
describe('Class Job', () => {
// --------------------------------------
  describe('#launch', () => {
    it('should return a resolved promise by default', function() {
      let p = new Job().launch()
      assert(p instanceof Promise)
      return p
    })
  })
  
  describe('#makePromise', () => {
    it('immediately resolved', function() {
      return new Job({
        makePromise: () => Promise.resolve()
      }).launch()
    })
    
    it('dealayed resolved', function() {
      return new Job({
        makePromise: () => new Promise((resolve, reject) => {
          setTimeout(resolve, 10)
        })
      }).launch()
    })
  })
  
  describe('#nextLaunchDate', () => {
    it('depends on .launchInterval', () => {
      const j = new Job({
        lastLaunchDate: new Date(5000),
        launchInterval: 1000,
      })
      
      assert.equal(j.nextLaunchDate().valueOf(), 6000)
    })
    
    it('is null when paused', () => {
      const j = new Job({
        lastLaunchDate: new Date(5000),
        launchInterval: 1000,
        paused: true
      })
      
      assert.isNull(j.nextLaunchDate())
    })
  })
})

// --------------------------------------
describe('Class Scheduler', () => {
// --------------------------------------
  describe('@iterator', () => {
    it ('iterates over jobs', () => {
      let s = new Scheduler()
        .addJob()
        .addJob()
      
      for(let j of s) {
        assert(j instanceof Job)
      }
    })
  })
  
  describe('#addJob', () => {
    it('job IDs must be unique', () => {
      assert.throws(() => {
        new Scheduler()
          .addJob({ id: 'a' })
          .addJob({ id: 'a' })
      })
      
      assert.doesNotThrow(() => {
        new Scheduler()
          .addJob({ id: 'a' })
          .addJob({ id: 'b' })
      })
    })
    
    it('launch repeatedly', function() {
      return new Promise((resolve, reject) => {
        let numLaunches = 0
        const s = new Scheduler()
          .addJob({
            id: 'a',
            launchInterval: 5,
            makePromise: () => {
              return Promise
                .resolve()
                .then(() => {
                  if (++numLaunches == 5) {
                    s.job('a').paused = true
                    resolve()
                  }
                })
            }
          })
      })
    })
  })
  
  describe('#jobs', () => {
    describe('@get', () => {
      it('should be instance of Array', () => {
        assert(new Scheduler().jobs instanceof Array)
      })
      
      it('should contain as many jobs as added', () => {
        let s = new Scheduler()
          .addJob({ id: 'a' })
          .addJob({ id: 'b' })
        
        let jobs = s.jobs
        
        assert(jobs.length == 2)
      })
    })
  })
  
  describe('#job', () => {
    it('Jobs can be retreived by id', () => {
      const j = new Job({ id: 'a' })
      const s = new Scheduler()
        .addJob(j)
      
      assert.equal(j, s.job('a'))
    })
  })
})
