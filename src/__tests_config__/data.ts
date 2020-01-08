import * as Redis from "ioredis";

export const testOptions: Redis.RedisOptions = {
    host: "redislabs-redistimeseries",
    db: 15
};
