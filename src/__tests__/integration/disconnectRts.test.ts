import { RedisTimeSeriesFactory } from "../../factory/redisTimeSeries";
import { testOptions } from "../../__tests_config__/data";

const factory = new RedisTimeSeriesFactory(testOptions);
const rtsClient = factory.create();

afterAll(async () => {
    const newRtsClient = factory.create();
    await newRtsClient.delete("disconnect");
    await newRtsClient.disconnect();
});

test("disconnect", async () => {
    const created = await rtsClient.create("disconnect");
    expect(created).toEqual(true);

    const disconnected = await rtsClient.disconnect();
    expect(disconnected).toEqual(true);

    await expect(rtsClient.create("after-disconnect")).rejects.toThrow();
});
