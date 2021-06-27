const redis = require('redis');
const bluebird = require('bluebird');
require("dotenv").config();

bluebird.promisifyAll(redis)
let client = redis.createClient({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379
})

client.on("ready",function () {
    console.log("Redis is ready");
});

client.on('error', function(err) {
    console.log('Redis error: ' + err);
});

module.exports= client;