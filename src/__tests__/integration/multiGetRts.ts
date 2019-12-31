import { RedisTimeSeriesFactory } from "../../factory";
import { testOptions } from "../../__tests_config__/data";
import { Sample } from "../../sample";
import { Label } from "../../label";
import { FilterBuilder } from "../../filter";

const factory = new RedisTimeSeriesFactory(testOptions);
const rtsClient = factory.create();
const date = new Date(2019, 11, 24, 19).getTime();

const label1 = new Label("label", "1");
const sensor1 = new Label("sensor", "1");
const sensor2 = new Label("sensor", "2");
const sensor3 = new Label("sensor", "3");

beforeAll(async () => {
    await rtsClient.create("multiget1", [label1, sensor1]);
    await rtsClient.create("multiget2", [label1, sensor2]);
    await rtsClient.create("multiget3", [sensor2, sensor3]);

    for (let i = 0; i < 10; i++) {
        await rtsClient.add(new Sample("multiget1", 20 + i, date + i * 1000));
        await rtsClient.add(new Sample("multiget2", 30 + i, date + i * 1000));
        await rtsClient.add(new Sample("multiget3", 40 + i, date + i * 1000));
    }
});

afterAll(async () => {
    await rtsClient.delete("multiget1", "multiget2", "multiget3");
});

test("query multi get with label1 filter successfully", async () => {
    const filter = new FilterBuilder("label", 1);
    const multiGets = await rtsClient.multiGet(filter);
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
    const labels1 = multiGet1.labels;
    expect(labels1.shift()).toEqual(label1);
    expect(labels1.shift()).toEqual(sensor2);

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
    expect(labels2.shift()).toEqual(sensor2);
    expect(labels2.shift()).toEqual(sensor3);

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
