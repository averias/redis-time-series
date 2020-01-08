import { RedisTimeSeriesFactory } from "../../factory/redisTimeSeries";
import { testOptions } from "../../__tests_config__/data";
import { Sample } from "../../entity/sample";
import { Label } from "../../entity/label";

const factory = new RedisTimeSeriesFactory(testOptions);
const rtsClient = factory.create();
const date = Date.now();
let memoryUsageChange2: number;
let memoryUsageChange3: number;

beforeAll(async () => {
    const sample = new Sample("change1", 20, date - 10000);
    await rtsClient.add(sample);
});

afterAll(async () => {
    await rtsClient.delete("change1", "change2", "change3", "change4", "change5");
    await rtsClient.disconnect();
});

test("increment successfully", async () => {
    const sample = new Sample("change1", 50, date - 5000);
    const incr = await rtsClient.incrementBy(sample);
    expect(incr).toEqual(date - 5000);

    const changed = await rtsClient.get("change1");
    expect(changed.getValue()).toEqual(70);
});

test("decrement successfully", async () => {
    const sample = new Sample("change1", 30, date);
    const decr = await rtsClient.decrementBy(sample);
    expect(decr).toEqual(date);

    const changed = await rtsClient.get("change1");
    expect(changed.getValue()).toEqual(40);
});

test("use increment for adding successfully", async () => {
    const sample = new Sample("change2", 50, date);
    const label = new Label("city1", "15");
    const incr = await rtsClient.incrementBy(sample, [label], 50000);
    expect(incr).toEqual(date);

    const changed = await rtsClient.get("change2");
    expect(changed.getValue()).toEqual(50);

    const info = await rtsClient.info("change2");
    expect(info.retentionTime).toEqual(50000);
    expect(info.labels.pop()).toEqual(label);
    memoryUsageChange2 = info.memoryUsage;
});

test("use decrement for adding successfully", async () => {
    const sample = new Sample("change3", 50, date);
    const label = new Label("city2", "75");
    const decr = await rtsClient.decrementBy(sample, [label], 70000);
    expect(decr).toEqual(date);

    const changed = await rtsClient.get("change3");
    expect(changed.getValue()).toEqual(-50);

    const info = await rtsClient.info("change3");
    expect(info.retentionTime).toEqual(70000);
    expect(info.labels.pop()).toEqual(label);
    memoryUsageChange3 = info.memoryUsage;
});

test("use increment for adding successfully with uncompressed", async () => {
    const sample = new Sample("change4", 50, date);
    const label = new Label("city3", "15");
    const incr = await rtsClient.incrementBy(sample, [label], 50000, true);
    expect(incr).toEqual(date);

    const changed = await rtsClient.get("change4");
    expect(changed.getValue()).toEqual(50);

    const info = await rtsClient.info("change4");
    expect(info.retentionTime).toEqual(50000);
    expect(info.labels.pop()).toEqual(label);
    expect(memoryUsageChange2).not.toEqual(info.memoryUsage);
});

test("use decrement for adding successfully", async () => {
    const sample = new Sample("change5", 50, date);
    const label = new Label("city3", "75");
    const decr = await rtsClient.decrementBy(sample, [label], 70000, true);
    expect(decr).toEqual(date);

    const changed = await rtsClient.get("change5");
    expect(changed.getValue()).toEqual(-50);

    const info = await rtsClient.info("change5");
    expect(info.retentionTime).toEqual(70000);
    expect(info.labels.pop()).toEqual(label);
    expect(memoryUsageChange3).not.toEqual(info.memoryUsage);
});
