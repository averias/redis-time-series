import { RedisTimeSeriesFactory } from "../../factory/redisTimeSeries";
import { testOptions } from "../../__tests_config__/data";
import { Sample } from "../../entity/sample";

const factory = new RedisTimeSeriesFactory(testOptions);
const rtsClient = factory.create();

beforeAll(async () => {
    await rtsClient.delete("exp1", "exp2");
    await rtsClient.create("exp1");
    await rtsClient.create("exp2");
});

afterAll(async () => {
    await rtsClient.delete("exp1", "exp2");
    await rtsClient.disconnect();
});

const wait = async (ms): Promise<void> => new Promise(res => setTimeout(() => res(), ms));

test("expire series successfully", async () => {
    const now = Date.now();
    const sample = new Sample("exp1", 10, now);
    const added = await rtsClient.add(sample);
    expect(added).toEqual(now);
    expect(await rtsClient.get("exp1")).toEqual(sample);

    const expired = await rtsClient.expire("exp1", 1);
    expect(expired).toEqual(true);
    await wait(1100);

    try {
        await rtsClient.get("exp1");
    } catch (error) {
        expect(error.message).toBe('error when executing command "TS.GET exp1": ERR TSDB: the key does not exist');
    }
});

test("fail to expire series with non-integer parameter", async () => {
    const now = Date.now();
    const sample = new Sample("exp2", 10, now);
    const added = await rtsClient.add(sample);
    expect(added).toEqual(now);
    expect(await rtsClient.get("exp2")).toEqual(sample);

    await expect(rtsClient.expire("exp2", 1.5)).rejects.toThrow(
        "Only integers allowed for 'seconds' parameter. 1.5 is not an integer."
    );
});

test("fail to expire series with non-existent key", async () => {
    const expired = await rtsClient.expire("exp3", 1);
    expect(expired).toEqual(false);
});
