class RateLimiter {

    constructor(limit, timeScale) {
        this.reqLimit = limit;
        this.scale = timeScale;
        this.date = new Date();
        this.timeLimit = 0;
        this.re
        this.refresh();
    }

    refresh() {
        if(this.date.getTime() > this.timeLimit) {
            this.tickets = this.reqLimit();
            this.timeLimit = this.date.getTime() + this.scale;
        }
    }

    getTicket() {
        this.refresh();
        if(this.tickets > 0) {
            this.tickets--;
            return {
                statusCode: 200,
                body: "Request granted"
            };
        } else {
            return {
                statusCode: 429,
                body: "Rate limit exceeded. Try again in"+this.timeLimit - this.date.getTime()+" seconds"
            }
        }
    }
}

export default RateLimiter;