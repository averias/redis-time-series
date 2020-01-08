import { RedisTimeSeriesFactory } from "../../factory/redisTimeSeries";
import { testOptions } from "../../__tests_config__/data";
import { Sample } from "../../entity/sample";

const factory = new RedisTimeSeriesFactory(testOptions);
const rtsClient = factory.create();
const date = new Date(2019, 11, 24, 20).getTime();

beforeAll(async () => {
    for (let i = 0; i < 10; i++) {
        await rtsClient.add(new Sample("get1", 20 + i, date + i * 1000));
    }
});

afterAll(async () => {
    await rtsClient.delete("get1");
    await rtsClient.disconnect();
});

test("get last value successfully", async () => {
    const sample = new Sample("get1", 29, date + 9000);
    const last = await rtsClient.get("get1");
    expect(last).toEqual(sample);
});

test("get recently added value successfully", async () => {
    const now = Date.now();
    const sample = new Sample("get1", 30, now);
    await rtsClient.add(sample);

    const last = await rtsClient.get("get1");
    expect(last).toEqual(sample);
});

test("get last value from a non existent key fails", async () => {
    await expect(rtsClient.get("get2")).rejects.toThrow();
});
