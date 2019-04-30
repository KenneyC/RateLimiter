import chai from 'chai';
import chaiHttp from 'chai-http';
import TimeScale from '../src/time-scale'
import RateLimiter from '../src/rate-limiter';
const describe = require("mocha");

chai.use(chaiHttp);
chai.should();

describe("#constructor()", () => {
    it('should set the correct limit and time scale', () => {
        let rl = new RateLimiter(100,TimeScale.HOUR);
        chai.assert.equal(rl.reqLimit,100);
        chai.assert.equal(rl.scale, 60000);
    });
})