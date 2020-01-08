import { RedisTimeSeriesFactory } from "../../factory/redisTimeSeries";
import { testOptions } from "../../__tests_config__/data";
import { Sample } from "../../entity/sample";
import { Label } from "../../entity/label";
import { FilterBuilder } from "../../builder/filterBuilder";

const factory = new RedisTimeSeriesFactory(testOptions);
const rtsClient = factory.create();
const date = new Date(2019, 11, 24, 19).getTime();

const label1 = new Label("label", "1");
const sensor1 = new Label("sensor", "1");
const sensor2 = new Label("sensor", "2");
const sensor3 = new Label("sensor", "3");

beforeAll(async () => {
    await rtsClient.create("queryindex1", [label1, sensor1]);
    await rtsClient.create("queryindex2", [label1, sensor2]);
    await rtsClient.create("queryindex3", [sensor2, sensor3]);

    await rtsClient.add(new Sample("queryindex1", 20, date));
    await rtsClient.add(new Sample("queryindex2", 30, date));
    await rtsClient.add(new Sample("queryindex3", 40, date));
});

afterAll(async () => {
    await rtsClient.delete("queryindex1", "queryindex2", "queryindex3");
    await rtsClient.disconnect();
});

test("query index with label1 filter successfully", async () => {
    const filter = new FilterBuilder("label", 1);
    const timeSeries = await rtsClient.queryIndex(filter);
    expect(Array.isArray(timeSeries)).toBe(true);

    expect(timeSeries.shift()).toEqual("queryindex1");
    expect(timeSeries.shift()).toEqual("queryindex2");
    expect(timeSeries.length).toBe(0);
});

test("query index with all sensors filter successfully", async () => {
    const filter = new FilterBuilder("sensor", 3).in("sensor", [1, 2]);
    const timeSeries = await rtsClient.queryIndex(filter);
    expect(Array.isArray(timeSeries)).toBe(true);

    expect(timeSeries.shift()).toEqual("queryindex3");
    expect(timeSeries.length).toBe(0);
});

test("query index with no sensors filter successfully", async () => {
    const filter = new FilterBuilder("sensor", 3).notIn("sensor", [1, 2]);
    const timeSeries = await rtsClient.queryIndex(filter);
    expect(Array.isArray(timeSeries)).toBe(true);

    expect(timeSeries.length).toBe(0);
});

test("query index with no labels in sensors filter successfully", async () => {
    const filter = new FilterBuilder("sensor", 3).notExists("sensor");
    const timeSeries = await rtsClient.queryIndex(filter);
    expect(Array.isArray(timeSeries)).toBe(true);

    expect(timeSeries.length).toBe(0);
});

test("query index with labels in sensors filter successfully", async () => {
    const filter = new FilterBuilder("sensor", 2).exists("sensor");
    const timeSeries = await rtsClient.queryIndex(filter);
    expect(Array.isArray(timeSeries)).toBe(true);

    expect(timeSeries.shift()).toEqual("queryindex2");
    expect(timeSeries.shift()).toEqual("queryindex3");
    expect(timeSeries.length).toBe(0);
});

test("query index with filter not matching", async () => {
    const filter = new FilterBuilder("sensor", 4);
    const timeSeries = await rtsClient.queryIndex(filter);
    expect(Array.isArray(timeSeries)).toBe(true);

    expect(timeSeries.length).toBe(0);
});
