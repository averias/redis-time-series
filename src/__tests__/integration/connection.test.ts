import { RedisTimeSeriesFactory } from "../../factory/redisTimeSeries";
import { ConnectionOptions } from "../../index";

test("lazy connection", async () => {
    const redisOptions: ConnectionOptions = {
        host: "redislabs-redistimeseries",
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
