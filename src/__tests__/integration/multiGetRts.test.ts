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
const sensor4 = new Label("sensor", "4");

beforeAll(async () => {
    await rtsClient.create("multiget1", [label1, sensor1]);
    await rtsClient.create("multiget2", [label1, sensor2]);
    await rtsClient.create("multiget3", [sensor2, sensor3]);
    await rtsClient.create("multiget4", [sensor4]);

    for (let i = 0; i < 10; i++) {
        await rtsClient.add(new Sample("multiget1", 20 + i, date + i * 1000));
        await rtsClient.add(new Sample("multiget2", 30 + i, date + i * 1000));
        await rtsClient.add(new Sample("multiget3", 40 + i, date + i * 1000));
    }
});

afterAll(async () => {
    await rtsClient.delete("multiget1", "multiget2", "multiget3", "multiget4");
    await rtsClient.disconnect();
});

test("query multi get with label1 filter successfully", async () => {
    const filter = new FilterBuilder("label", 1);
    const multiGets = await rtsClient.multiGet(filter, true);
    expect(Array.isArray(multiGets)).toBe(true);

    const multiGet1 = multiGets.shift();
    expect(multiGet1).not.toEqual(undefined);
    // @ts-ignore
    expect(multiGet1.key).toEqual("multiget1");
    // @ts-ignore
    const labels1 = multiGet1.labels;
    expect(labels1.shift()).toEqual(label1);
    expect(labels1.shift()).toEqual(sensor1);

    // @ts-ignore
    const sample1 = multiGet1.data;
    // @ts-ignore
    expect(sample1.getValue()).toEqual(29);
    expect(sample1.getTimestamp()).toEqual(date + 9000);

    const multiGet2 = multiGets.shift();
    expect(multiGet2).not.toEqual(undefined);
    // @ts-ignore
    expect(multiGet2.key).toEqual("multiget2");
    // @ts-ignore
    const labels2 = multiGet2.labels;
    expect(labels2.shift()).toEqual(label1);
    expect(labels2.shift()).toEqual(sensor2);

    // @ts-ignore
    const sample2 = multiGet2.data;
    // @ts-ignore
    expect(sample2.getValue()).toEqual(39);
    expect(sample2.getTimestamp()).toEqual(date + 9000);

    expect(multiGets.length).toBe(0);
});

test("query multi get with sensor2 filter successfully", async () => {
    const filter = new FilterBuilder("sensor", 2);
    const multiGets = await rtsClient.multiGet(filter);
    expect(Array.isArray(multiGets)).toBe(true);

    const multiGet1 = multiGets.shift();
    expect(multiGet1).not.toEqual(undefined);
    // @ts-ignore
    expect(multiGet1.key).toEqual("multiget2");
    // @ts-ignore
    const labels = multiGet1.labels;
    expect(labels.length).toBe(0);

    // @ts-ignore
    const sample1 = multiGet1.data;
    // @ts-ignore
    expect(sample1.getValue()).toEqual(39);
    expect(sample1.getTimestamp()).toEqual(date + 9000);

    const multiGet2 = multiGets.shift();
    expect(multiGet2).not.toEqual(undefined);
    // @ts-ignore
    expect(multiGet2.key).toEqual("multiget3");
    // @ts-ignore
    const labels2 = multiGet2.labels;
    expect(labels2.length).toBe(0);

    // @ts-ignore
    const sample2 = multiGet2.data;
    // @ts-ignore
    expect(sample2.getValue()).toEqual(49);
    expect(sample2.getTimestamp()).toEqual(date + 9000);

    expect(multiGets.length).toBe(0);
});

test("query multi get with filter not matching", async () => {
    const filter = new FilterBuilder("sensor", 3).notIn("sensor", [1, 2]);
    const multiGets = await rtsClient.multiGet(filter);
    expect(Array.isArray(multiGets)).toBe(true);
    expect(multiGets.length).toBe(0);
});

test("query multi get with filter matching but no data", async () => {
    const filter = new FilterBuilder("sensor", 4);
    const multiGets = await rtsClient.multiGet(filter, true);
    expect(Array.isArray(multiGets)).toBe(true);

    const multiGet1 = multiGets.shift();
    expect(multiGet1).not.toEqual(undefined);
    // @ts-ignore
    expect(multiGet1.key).toEqual("multiget4");
    // @ts-ignore
    const labels1 = multiGet1.labels;
    expect(labels1.shift()).toEqual(sensor4);
    expect(labels1.length).toBe(0);

    // @ts-ignore
    const sample1 = multiGet1.data;
    // @ts-ignore
    expect(sample1.getValue()).toEqual(0);
    expect(sample1.getTimestamp()).toEqual(0);
});
