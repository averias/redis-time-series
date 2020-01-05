import { RedisTimeSeriesFactory } from "../../factory";
import * as Redis from "ioredis";

test("lazy connection", async () => {
    const redisOptions: Redis.RedisOptions = {
        port: 6381,
        host: "127.0.0.1",
        db: 15,
        lazyConnect: true
    };
    const factory = new RedisTimeSeriesFactory(redisOptions);
    const rtsClient = factory.create();
    const created = await rtsClient.create("connection");
    expect(created).toEqual(true);

    const deleted = await rtsClient.delete("connection");
    expect(deleted).toEqual(true);

    const disconnected = await rtsClient.disconnect();
    expect(disconnected).toEqual(true);
});
