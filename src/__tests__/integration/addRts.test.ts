import { RedisTimeSeriesFactory } from "../../factory/redisTimeSeries";
import { testOptions } from "../../__tests_config__/data";
import { Sample } from "../../entity/sample";
import { Label } from "../../entity/label";

const factory = new RedisTimeSeriesFactory(testOptions);
const rtsClient = factory.create();

beforeAll(async () => {
    await rtsClient.create("add1");
});

afterAll(async () => {
    await rtsClient.delete("add1", "add2", "add3", "add4", "add5", "add6", "add7", "add8");
    await rtsClient.disconnect();
});

test("append values successfully", async () => {
    const now = Date.now();
    const sample = new Sample("add1", 10, now);
    const added = await rtsClient.add(sample);
    expect(added).toEqual(now);

    const testSample = await rtsClient.get("add1");
    expect(testSample).toEqual(sample);
});

test("create and append values successfully", async () => {
    const now = Date.now();
    const sample = new Sample("add2", 100, now);
    const label = new Label("color2", "15");
    const added = await rtsClient.add(sample, [label], 50000);
    expect(added).toEqual(now);

    const testSample = await rtsClient.get("add2");
    expect(testSample).toEqual(sample);

    const info = await rtsClient.info("add2");
    expect(info.retentionTime).toEqual(50000);

    const sensor1Label = info.labels.pop();
    expect(sensor1Label).toStrictEqual(label);
    expect(info.labels.length).toEqual(0);
});

test("append to existing key with retention and labels is ignored", async () => {
    const previousInfo = await rtsClient.info("add2");
    const now = Date.now();
    const sample = new Sample("add2", 1000, now);
    const label = new Label("color3", "75");
    const added = await rtsClient.add(sample, [label], 45000);
    expect(added).toEqual(now);

    const info = await rtsClient.info("add2");
    expect(info.retentionTime).toEqual(previousInfo.retentionTime);
    expect(info.labels.pop()).toEqual(previousInfo.labels.pop());
});

test("append with default timestamp", async () => {
    const startTime = Date.now();
    const sample = new Sample("add3", 1000);
    const added = await rtsClient.add(sample);
    const endTime = Date.now();

    expect(added).toBeGreaterThanOrEqual(startTime);
    expect(added).toBeLessThanOrEqual(endTime);
    expect(sample.getTimestamp()).toEqual("*");
});

test("append with float timestamp, truncate it", async () => {
    const almostNow = Date.now() - 1000.69;
    const sample = new Sample("add6", 700, almostNow);
    const added = await rtsClient.add(sample);
    expect(added).toEqual(Math.trunc(almostNow));
});

test("multi add successfully", async () => {
    const now = Date.now();
    const sample10 = new Sample("add4", 10, now - 2000);
    const addedSample10 = await rtsClient.add(sample10, undefined, 10000);
    expect(addedSample10).toEqual(now - 2000);

    const sample20 = new Sample("add4", 20, now - 1000);
    const sample30 = new Sample("add4", 30, now);
    const added = await rtsClient.multiAdd([sample20, sample30]);

    expect(added[0]).toEqual(now - 1000);
    expect(added[1]).toEqual(now);
});

test("multi add a too old sample fails", async () => {
    const now = Date.now();
    const sample40 = new Sample("add4", 40, now - 150000);
    const sample50 = new Sample("add4", 50, now);
    const added = await rtsClient.multiAdd([sample40, sample50]);

    // @ts-ignore
    expect(added[0].message).toMatch(/ERR TSDB: Timestamp is older than retention/);
    expect(added[1]).toEqual(now);
});

test("multi add a non existent key fails", async () => {
    const now = Date.now();
    const sample50 = new Sample("add5", 40, now - 500000);
    const added = await rtsClient.multiAdd([sample50]);

    // @ts-ignore
    expect(added[0].message).toMatch(/the key is not a TSDB key/);
});

test("append with valid chunk size and duplicate policy to existing key", async () => {
    const sample = new Sample("add6", 1000);
    await rtsClient.add(sample, [], 3000, 8000, "LAST");

    const info = await rtsClient.info("add6");

    expect(info.chunkSize).toBe(4096); // because series already exists
});

test("append with valid chunk size and duplicate policy to new key", async () => {
    const sample = new Sample("add7", 1000);
    await rtsClient.add(sample, [], 3000, 8000, "LAST");

    const info = await rtsClient.info("add7");

    expect(info.chunkSize).toBe(8000);
});

test("create time series with invalid duplication policy", async () => {
    const sample = new Sample("add8", 1000);
    await expect(rtsClient.add(sample, [], 3000, 8000, "HELLO")).rejects.toThrow(
        "duplicate policy must be either BLOCK, FIRST, LAST, MIN, MAX or SUM, found: HELLO"
    );
});
