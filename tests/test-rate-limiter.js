const mocha = require('mocha');
const describe = mocha.describe;
const chai = require('chai');
const chaiHttp = require('chai-http');
const TimeScale = require('../src/time-scale');
const BucketRateLimiter = require('../src/rate-limiter/bucket-rate-limiter');

chai.use(chaiHttp);
chai.should();

describe("BucketRateLimiter#constructor()", () => {
    it('should set the correct limit and time scale', () => {
        let rl = new BucketRateLimiter(100,TimeScale.HOUR);
        chai.assert.equal(rl.getRequestLimit(),100);
        chai.assert.equal(rl.getTimeScale(), 3600000);
    });
});

describe('BucketRateLimiter#getTicket()', () => {
    let token = 'user1';

    class MockDate {
        getTime() {
            return 12345;
        }
    }

    class MockDateRefresh {
        getTime() {
            let date = new Date();
            return date.getTime()+TimeScale.HOUR+1;
        }
    }

    class MockDateTimeRemaining {
        getTime() {
            return 12346;
        }
    }

    it('should allow request to go through with one request', () => {
        let rl = new BucketRateLimiter(100,TimeScale.HOUR);
        let response = rl.attemptIssueTicket(token);
        chai.assert.equal(response.statusCode,200);
    });

    it('should allow request to go through within limit', () => {
        let rl = new BucketRateLimiter(100,TimeScale.HOUR);
        let response1 = rl.attemptIssueTicket(token);
        let response2 = rl.attemptIssueTicket(token);
        chai.assert.equal(response1.statusCode, 200);
        chai.assert.equal(response2.statusCode, 200);
    });

    it('should decrement tickets per request', () => {
        let rl = new BucketRateLimiter(100,TimeScale.HOUR);
        rl.attemptIssueTicket(token);
        chai.assert.equal(rl.getTicketRemaining(token),99);
        rl.attemptIssueTicket(token);
        chai.assert.equal(rl.getTicketRemaining(token),98);
    });

    it('should not allow request to through when limit exceeded', () => {
        let rl = new BucketRateLimiter(1,TimeScale.HOUR);
        let response1 = rl.attemptIssueTicket(token);
        chai.assert.equal(response1.statusCode, 200);
        try {
            rl.attemptIssueTicket(token);
        } catch(error) {
            chai.assert(error.message,'Rate limit exceeded. Try again in 3600000 seconds');
        }
    });

    it('should have no interference between two different users', () => {
        let rl = new BucketRateLimiter(100,TimeScale.HOUR);
        let token2 = 'user2';
        let response1 = rl.attemptIssueTicket(token);
        let response2 = rl.attemptIssueTicket(token2);
        chai.assert.equal(response1.statusCode, 200);
        chai.assert.equal(response2.statusCode, 200);
    });

    it('should allow request to go through after refresh', () => {
        let rl = new BucketRateLimiter(1,TimeScale.HOUR);
        let response = rl.attemptIssueTicket(token);
        let oldTime = rl.getTimeRecorded(token);
        chai.assert.equal(response.statusCode, 200);
        try {
            rl.attemptIssueTicket(token);
        } catch(error) {
            chai.assert(error.message,'Rate limit exceeded. Try again in 3600000 seconds');
        }
        rl.date = new MockDateRefresh();
        let response2 = rl.attemptIssueTicket(token);
        chai.assert.isTrue(rl.getTimeRecorded(token) > oldTime)
        chai.assert.equal(response2.statusCode, 200);
    });

    it('should return the correct time remaining', () => {
        let rl = new BucketRateLimiter(1,TimeScale.HOUR);
        rl.date = new MockDate();
        rl.attemptIssueTicket(token);
        rl.date = new MockDateTimeRemaining();
        try {
            rl.attemptIssueTicket(token);
        } catch(error) {
            chai.assert(error.message,'Rate limit exceeded. Try again in 3599999 seconds');
        }
    })
});

describe('application#app', () => {
    let app;
    beforeEach(() => {
        app = require ('../src/application');
    });
    describe('GET /', () => {
        it('should successfully make a request', (done) => {
            chai.request(app).get('/?id=user_1')
                .end((err,res) => {
                    chai.expect(res).to.have.status(200);
                    res.text.should.be.eq('Request granted');
                    done();
                });
        });

        it('should reject after making too many requests and does not interfere with a different user', (done) => {
            for(let i =0;i<4;i++) {
                chai.request(app).get('/?id=user_1')
                    .end((err,res) => {
                        chai.expect(res).to.have.status(200);
                        res.text.should.be.eq('Request granted');
                    });
            }
            chai.request(app).get('/?id=user_1')
                .end((err,res) => {
                    chai.expect(res).to.have.status(429);
                });
            chai.request(app).get('/?id=user_2')
                .end((err,res) => {
                    chai.expect(res).to.have.status(200);
                    res.text.should.be.eq('Request granted');
                    done();
                });
        })
    });
});

