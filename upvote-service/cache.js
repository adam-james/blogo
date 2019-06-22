const redis = require("redis");
const bluebird = require("bluebird");

const { NODE_ENV, REDIS_PORT, REDIS_HOST, REDIS_KEY } = process.env;

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

let cache;

if (NODE_ENV == "production") {
  cache = redis.createClient(REDIS_PORT, REDIS_HOST, {
    auth_pass: REDIS_KEY,
    tls: { servername: REDIS_HOST }
  });
} else {
  cache = redis.createClient("redis://upvote_db");
}

module.exports = cache;
