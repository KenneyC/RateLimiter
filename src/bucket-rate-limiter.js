const RateLimiterTemplate = require('./rate-limiter-template');

/*
    A rate limiter that implements the leaky bucket algorithm.
    Author: Kenney Chan
 */
class BucketRateLimiter extends RateLimiterTemplate {
    constructor(limit, timeScale) {
        super();
        let requestLimit = limit;
        let scale = timeScale;
        let userTrack = {};
        this.date = new Date();

        /*
            Refreshes the number of tickets or requests the user has. The method will refresh the number of tickets
            if this is the user's first request, or when it has reached the chosen time scale since the first request.
            @param {string} user: the token that identifies the user making the request.
         */
        this.refresh = (user) => {
            let info = userTrack[user];
            if(!(user in userTrack) || this.date.getTime() > info.timeRecord+scale) {
                userTrack[user] = {
                    ticket: requestLimit,
                    timeRecord: this.date.getTime()
                }
            }
        };

        /*
            Attempts to get a ticket to make a request. It checks if a ticket is available and
            returns the correct response according to the attempt.
            @param {string} token: the token that identifies the user making the request
            @return {object}: a response with the status code and a message according to the attempt.
         */
        this.getTicket = (token) => {
            let info = userTrack[token];
            if(info.ticket > 0) {
                info.ticket--;
                return {
                    statusCode: 200,
                    body: 'Request granted'
                };
            } else {
                return {
                    statusCode: 429,
                    body: 'Rate limit exceeded. Try again in '+ (userTrack[token].timeRecord + scale - this.date.getTime()).toString()+' seconds'
                }
            }
        };

        /*
            Public getter method to check tickets remaining.
            @param {string} token: the token that identifies the user making the request
            @return {number}: the number of tickets remaining
         */
        this.getTicketRemaining = function(token) {
            return userTrack[token].ticket;
        };

        /*
            Public getter method to check when the timer starts.
            @param {string} token: the token that identifies the user making the request
            @return {number}: when the timer started.
         */
        this.getTimeRecorded = (token) => {
            return userTrack[token].timeRecord;
        };

        /*
            Public getter method to get the request limit that was set.
            @return {number}: the request limit that was set.
         */
        this.getRequestLimit = () => {
            return requestLimit;
        };

        /*
            Public getter method to get the time window size
            @return {number}: the time window size
         */
        this.getTimeScale = () => {
            return scale;
        };
    }
}


module.exports = BucketRateLimiter;