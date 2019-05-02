/*
    Script that turns on a web application with rate-limiting functionality.
    Author: Kenney Chan
 */

const express = require('express');
const BucketRateLimiter = require('./rate-limiter/bucket-rate-limiter');
const TimeScale = require('./time-scale');

const port = 3000;
const app = express();
const rateLimiter = new BucketRateLimiter(5,TimeScale.MINUTE);

app.use('/' , (req,res,next) => {
    let id = req.query.id;
    new Promise((resolve,reject) => {
        resolve(rateLimiter.attemptIssueTicket(id));
    }).then((data)=> {
        res.status(data.statusCode).send(data.body);
    }).catch((reqRejection) => {
        res.status(429).send(reqRejection.message);
    })
})

app.listen(port,() => {
    console.log('Application started on port 3000');
})

module.exports = app;