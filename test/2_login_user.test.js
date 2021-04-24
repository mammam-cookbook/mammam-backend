const expect = require("chai").expect;
const request = require("supertest");
const app = require("../server");

describe("/api/auth", () => {
  it("should get jwt if correct credentials are passed", (done) => {
    const user = {
      email: '1753014@student.hcmus.edu.vn',
      password: "12345678"
    }
    request(app)
      .post("/api/auth")
      .send({ email: user.email, password: user.password })
      .expect(200)
      .then((res) => {
        console.log('---------------- res.body -------------', res.body)
        expect(res.body).to.have.property('token');
        expect(res.body).to.have.property('user');
        done();
      })
      .catch((err) => done(err));
  });
});
