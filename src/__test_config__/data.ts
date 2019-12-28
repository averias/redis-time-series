import * as Redis from "ioredis";

export const testOptions: Redis.RedisOptions = {
    port: 6381,
    host: "127.0.0.1",
    db: 15
};
