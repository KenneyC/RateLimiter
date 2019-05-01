class RateLimiterTemplate {

    constructor() {
    }

    attemptIssueTicket(token) {
        this.refresh(token);
        return this.getTicket(token);
    };

    refresh(token) {
        throw new Error('This is a template method!');
    };
    getTicket(token) {
        throw new Error('This is a template method!')
    };


}

module.exports = RateLimiterTemplate;