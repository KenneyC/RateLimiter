import TimeScale from './time-scale'
import RateLimiter from './rate-limiter'
const express = require('express');
const app = express();

let rateLimiter;

app.get('/', (req,res) => {
    let check = rateLimiter.getTicket();
    if(check.statusCode === 200) {
        //action
    }
    res.send(check);
})

app.listen(port, ()=> {
    console.log('App is now listening');
})



export default app;
