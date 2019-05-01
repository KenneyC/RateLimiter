/*
    A abstract class that represents a rate limiter. This class follows the template method design pattern to allow
    extension and modification to the rate limiting algorithm.
    Author: Kenney Chan
 */
class RateLimiterTemplate {

    constructor() {
    }

    /*
        The template method that is shared among all rate limiting algorithm. This method is called when users make an
        request.
        @param {string} token: the token that identifies the user making the request
        @return {string}: the response to the user's attempt to make a request.
     */
    attemptIssueTicket(token) {
        this.refresh(token);
        return this.getTicket(token);
    };

    /*
        One of abstract methods that needs to be implemented. This is abstract as all rate limiting algorithm need
        to refresh it's cache but how and what depends on the algorithm.
        @param {string} token: the token that identifies the user making the request
        @throw {error}: if this abstract method is called it will throw an error
     */
    refresh(token) {
        throw new Error('This is a template method! Please extend this class and implement this method.');
    };

    /*
        One of the abstract method that needs to be implemented. This is abstract as all rate limiting algorithm will
        need to attempt to get a ticket, how it determines success depends on the algorithm.
        @param {string} token: the token that identifies the user making the request
        @throw {error}: if this abstract method is called it will throw an error
     */
    getTicket(token) {
        throw new Error('This is a template method! Please extend this class and implement this method.')
    };
}

module.exports = RateLimiterTemplate;