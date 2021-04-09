const expect = require("chai").expect;
const request = require("supertest");
const app = require("../server");
const accounts = require('./data/unitTestAccount');

describe("/api/user", () => {
  it("should return successful message user 1", (done) => {
    const user = accounts[0]
    request(app)
      .post("/api/user")
      .send(user)
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal({message: 'Sign up success! Please signin'});
        done();
      })
      .catch((err) => done(err));
  });

  it("should return successful message user 2", (done) => {
    const user = accounts[1];
    request(app)
      .post("/api/user")
      .send(user)
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal({message: 'Sign up success! Please signin'});
        done();
      })
      .catch((err) => done(err));
  });

  it("should return successful message user 3", (done) => {
    const user = accounts[2];
    request(app)
      .post("/api/user")
      .send({ email: user.email, password: user.password })
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal({message: 'Sign up success! Please signin'});
        done();
      })
      .catch((err) => done(err));
  });
});
