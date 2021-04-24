const expect = require("chai").expect;
const request = require("supertest");
const jwt = require("jsonwebtoken");
const accounts = require("./data/unitTestAccount");
console.log('----------------- accounts --------------', accounts)

describe("/api/user/getUserProfileData", () => {
  let tokenJWT, userId, userId1;
  it("getting jwt", (done) => {
    const user = {
      ...getUser(0),
    };
    User.findOne({ username: user.username })
      .select("_id")
      .then(({ _id }) => {
        const token = jwt.sign(
          {
            email: user.email,
            userId: _id,
            username: user.username,
          },
          process.env.JWT_KEY,
          {
            expiresIn: "30m",
          }
        );
        userId1 = _id;
        tokenJWT = "Bearer " + token;
        User.findOne({ username: getUser(1).username }).then(({ _id }) => {
          userId = _id;
          done();
        });
      });
  });

  it("should follow", (done) => {
    request(app)
      .post("/api/user/follow")
      .set("authorization", tokenJWT)
      .send({ userId })
      .expect(200)
      .then((res) => {
        expect(res.body).to.have.all.keys("userId", "action");
        expect(res.body.action).to.equal("followed");
        done();
      })
      .catch((err) => done(err));
  });

  it("should not follow itself", (done) => {
    request(app)
      .post("/api/user/followUser")
      .set("Authorization", tokenJWT)
      .send({ userId: userId1 })
      .expect(403)
      .then((res) => {
        expect(res.body).to.have.all.keys("message");
        expect(res.body.message).to.equal("Failed to follow");
        done();
      })
      .catch((err) => done(err));
  });

  it("should get followers of user 1", (done) => {
    const user = {
      ...getUser(0),
    };
    request(app)
      .post("/api/user/getUserProfileFollowers")
      .set("Authorization", tokenJWT)
      .send({ userId: userId })
      .expect(200)
      .then((res) => {
        expect(res.body.users[0].followers).to.have.lengthOf(1);
        expect(res.body.users[0].followers[0].user.username).to.equal(
          user.username
        );
        done();
      })
      .catch((err) => done(err));
  });

  it("should get followings of user 1", (done) => {
    const user = {
      ...getUser(0),
    };
    request(app)
      .post("/api/user/getUserProfileFollowings")
      .set("Authorization", tokenJWT)
      .send({ userId: userId })
      .expect(200)
      .then((res) => {
        expect(res.body.users[0].following).to.have.lengthOf(0);
        done();
      })
      .catch((err) => done(err));
  });

  it("should get followers of user 2", (done) => {
    const user = {
      ...getUser(0),
    };
    request(app)
      .post("/api/user/getUserProfileFollowers")
      .set("Authorization", tokenJWT)
      .send({ userId: userId1 })
      .expect(200)
      .then((res) => {
        expect(res.body.users[0].followers).to.have.lengthOf(0);
        done();
      })
      .catch((err) => done(err));
  });

  it("should get followings of user 2", (done) => {
    const user = {
      ...getUser(1),
    };
    request(app)
      .post("/api/user/getUserProfileFollowings")
      .set("Authorization", tokenJWT)
      .send({ userId: userId1 })
      .expect(200)
      .then((res) => {
        expect(res.body.users[0].following).to.have.lengthOf(1);
        expect(res.body.users[0].following[0].user.username).to.equal(
          user.username
        );
        done();
      })
      .catch((err) => done(err));
  });

  it("should unfollow", (done) => {
    request(app)
      .post("/api/user/followUser")
      .set("Authorization", tokenJWT)
      .send({ userId })
      .expect(200)
      .then((res) => {
        expect(res.body).to.have.all.keys("userId", "action");
        expect(res.body.action).to.equal("unfollowed");
        done();
      })
      .catch((err) => done(err));
  });

  it("should modify right documents when unfollowd", async () => {
    const docF = await Following.findOne({ user: userId1 });
    expect(docF.following).to.have.lengthOf(0);

    const docFo = await Followers.findOne({ user: userId });
    expect(docFo.followers).to.have.lengthOf(0);
  });

  it("should not follow non existing user", (done) => {
    request(app)
      .post("/api/user/followUser")
      .set("Authorization", tokenJWT)
      .send({ userId: fakeId })
      .expect(404)
      .then((res) => {
        expect(res.body).to.have.all.keys("message");
        expect(res.body.message).to.equal("User not found");
        done();
      })
      .catch((err) => done(err));
  });
});
