import { RedisTimeSeriesFactory } from "../../factory/redisTimeSeries";
import { testOptions } from "../../__tests_config__/data";
import { Sample } from "../../entity/sample";
import { Aggregation } from "../../entity/aggregation";
import { AggregationType } from "../../enum/aggregationType";
import { TimestampRange } from "../../entity/timestampRange";
import { Label } from "../../entity/label";
import { FilterBuilder } from "../../builder/filterBuilder";

const factory = new RedisTimeSeriesFactory(testOptions);
const rtsClient = factory.create();
const date = new Date(2019, 11, 24, 19).getTime();

const label1 = new Label("label", "1");
const sensor1 = new Label("sensor", "1");
const sensor2 = new Label("sensor", "2");
const sensor3 = new Label("sensor", "3");
const sensorString = new Label("sensor", "sensorvalue");

beforeAll(async () => {
    await rtsClient.create("multirange1", [label1, sensor1]);
    await rtsClient.create("multirange2", [label1, sensor2]);
    await rtsClient.create("multirange3", [sensor2, sensor3]);
    await rtsClient.create("multirange4", [sensorString]);

    for (let i = 0; i < 10; i++) {
        await rtsClient.add(new Sample("multirange1", 20 + i, date + i * 1000));
        await rtsClient.add(new Sample("multirange2", 30 + i, date + i * 1000));
        await rtsClient.add(new Sample("multirange3", 40 + i, date + i * 1000));
        await rtsClient.add(new Sample("multirange4", 50 + i, date + i * 1000));
    }
});

afterAll(async () => {
    await rtsClient.delete("multirange1", "multirange2", "multirange3", "multirange4");
    await rtsClient.disconnect();
});

test("sum aggregated query multi range with label1 filter successfully", async () => {
    const aggregation = new Aggregation(AggregationType.SUM, 5000);
    const timestampRange = new TimestampRange(date, date + 10000);
    const filter = new FilterBuilder("label", 1);
    const multiRanges = await rtsClient.multiRevRange(timestampRange, filter, undefined, aggregation, true);
    expect(Array.isArray(multiRanges)).toBe(true);

    const multiRange1 = multiRanges.shift();
    expect(multiRange1).not.toEqual(undefined);
    // @ts-ignore
    expect(multiRange1.key).toEqual("multirange1");
    // @ts-ignore
    const labels1 = multiRange1.labels;
    expect(labels1.shift()).toEqual(label1);
    expect(labels1.shift()).toEqual(sensor1);

    // @ts-ignore
    const samples1 = multiRange1.data;
    // @ts-ignore
    expect(samples1.shift().getValue()).toEqual(135);
    // @ts-ignore
    expect(samples1.shift().getValue()).toEqual(110);

    const multiRange2 = multiRanges.shift();
    expect(multiRange2).not.toEqual(undefined);
    // @ts-ignore
    expect(multiRange2.key).toEqual("multirange2");
    // @ts-ignore
    const labels2 = multiRange2.labels;
    expect(labels2.shift()).toEqual(label1);
    expect(labels2.shift()).toEqual(sensor2);

    // @ts-ignore
    const samples2 = multiRange2.data;
    // @ts-ignore
    expect(samples2.shift().getValue()).toEqual(185);
    // @ts-ignore
    expect(samples2.shift().getValue()).toEqual(160);

    expect(multiRanges.length).toBe(0);
});

test("max aggregated query multi range with label1 and sensor1 filters successfully", async () => {
    const aggregation = new Aggregation(AggregationType.MAX, 5000);
    const timestampRange = new TimestampRange(date, date + 10000);
    const filter = new FilterBuilder("label", 1).equal("sensor", 1);
    const multiRanges = await rtsClient.multiRevRange(timestampRange, filter, undefined, aggregation, true);
    expect(Array.isArray(multiRanges)).toBe(true);

    const multiRange = multiRanges.shift();
    expect(multiRange).not.toEqual(undefined);
    // @ts-ignore
    expect(multiRange.key).toEqual("multirange1");
    // @ts-ignore
    const labels = multiRange.labels;
    expect(labels.shift()).toEqual(label1);
    expect(labels.shift()).toEqual(sensor1);

    // @ts-ignore
    const samples = multiRange.data;
    // @ts-ignore
    expect(samples.shift().getValue()).toEqual(29);
    // @ts-ignore
    expect(samples.shift().getValue()).toEqual(24);

    expect(multiRanges.length).toBe(0);
});

test("max aggregated query multi range with sensor string filter successfully", async () => {
    const aggregation = new Aggregation(AggregationType.MAX, 5000);
    const timestampRange = new TimestampRange(date, date + 10000);
    const filter = new FilterBuilder("sensor", "sensorvalue");
    const multiRanges = await rtsClient.multiRevRange(timestampRange, filter, undefined, aggregation, true);
    expect(Array.isArray(multiRanges)).toBe(true);

    const multiRange = multiRanges.shift();
    expect(multiRange).not.toEqual(undefined);
    // @ts-ignore
    expect(multiRange.key).toEqual("multirange4");
    // @ts-ignore
    const labels = multiRange.labels;
    expect(labels.shift()).toEqual(sensorString);

    // @ts-ignore
    const samples = multiRange.data;
    // @ts-ignore
    expect(samples.shift().getValue()).toEqual(59);
    // @ts-ignore
    expect(samples.shift().getValue()).toEqual(54);

    expect(multiRanges.length).toBe(0);
});

test("min aggregated query multi range with not label1 ans sensor2 filters successfully", async () => {
    const aggregation = new Aggregation(AggregationType.MIN, 5000);
    const timestampRange = new TimestampRange(date, date + 10000);
    const filter = new FilterBuilder("sensor", 2).notEqual("label", 1);
    const multiRanges = await rtsClient.multiRevRange(timestampRange, filter, undefined, aggregation, true);
    expect(Array.isArray(multiRanges)).toBe(true);

    const multiRange = multiRanges.shift();
    expect(multiRange).not.toEqual(undefined);
    // @ts-ignore
    expect(multiRange.key).toEqual("multirange3");
    // @ts-ignore
    const labels = multiRange.labels;
    expect(labels.shift()).toEqual(sensor2);
    expect(labels.shift()).toEqual(sensor3);

    // @ts-ignore
    const samples = multiRange.data;
    // @ts-ignore
    expect(samples.shift().getValue()).toEqual(45);
    // @ts-ignore
    expect(samples.shift().getValue()).toEqual(40);

    expect(multiRanges.length).toBe(0);
});

test("count aggregated query multi range with filters not matching", async () => {
    const aggregation = new Aggregation(AggregationType.COUNT, 5000);
    const timestampRange = new TimestampRange(date, date + 10000);
    const filter = new FilterBuilder("sensor", 3).notIn("sensor", [1, 2]);
    const multiRanges = await rtsClient.multiRevRange(timestampRange, filter, undefined, aggregation);
    expect(Array.isArray(multiRanges)).toBe(true);

    expect(multiRanges.length).toBe(0);
});

test("max aggregated query multi range with sensor3 filter and count optional param", async () => {
    const aggregation = new Aggregation(AggregationType.MAX, 5000);
    const timestampRange = new TimestampRange(date, date + 10000);
    const filter = new FilterBuilder("sensor", 3).notEqual("label", 1);
    const multiRanges = await rtsClient.multiRevRange(timestampRange, filter, 1, aggregation, true);
    expect(Array.isArray(multiRanges)).toBe(true);

    const multiRange = multiRanges.shift();
    expect(multiRange).not.toEqual(undefined);
    // @ts-ignore
    expect(multiRange.key).toEqual("multirange3");
    // @ts-ignore
    const labels = multiRange.labels;
    expect(labels.shift()).toEqual(sensor2);
    expect(labels.shift()).toEqual(sensor3);

    // @ts-ignore
    const samples = multiRange.data;
    // @ts-ignore
    expect(samples.shift().getValue()).toEqual(49);

    expect(samples.length).toBe(0);
    expect(multiRanges.length).toBe(0);
});

test("aggregated query multi range with filter not matching", async () => {
    const aggregation = new Aggregation(AggregationType.COUNT, 5000);
    const timestampRange = new TimestampRange(date, date + 10000);
    const filter = new FilterBuilder("sensor", 3).notIn("sensor", [1, 2]);
    const multiRanges = await rtsClient.multiRevRange(timestampRange, filter, undefined, aggregation, true);
    expect(Array.isArray(multiRanges)).toBe(true);

    expect(multiRanges.length).toBe(0);
});

test("aggregated query multi range with default timestamp and without labels", async () => {
    const timestampRange = new TimestampRange();
    const filter = new FilterBuilder("sensor", 3).notEqual("label", 1);
    const multiRanges = await rtsClient.multiRevRange(timestampRange, filter, 3);
    expect(Array.isArray(multiRanges)).toBe(true);

    const multiRange = multiRanges.shift();
    expect(multiRange).not.toEqual(undefined);
    // @ts-ignore
    expect(multiRange.key).toEqual("multirange3");
    // @ts-ignore
    expect(multiRange.labels.length).toBe(0);

    // @ts-ignore
    const samples = multiRange.data;
    // @ts-ignore
    expect(samples.shift().getValue()).toEqual(49);
    // @ts-ignore
    expect(samples.shift().getValue()).toEqual(48);
    // @ts-ignore
    expect(samples.shift().getValue()).toEqual(47);

    expect(samples.length).toBe(0);
    expect(multiRanges.length).toBe(0);
});

test("aggregated query multi range with timestamp range not matching", async () => {
    const now = Date.now();
    const start = now - 10000;
    const timestampRange = new TimestampRange(start, now);
    const filter = new FilterBuilder("sensor", 3);
    for (const key in AggregationType) {
        const aggregationType = AggregationType[key];
        const aggregation = new Aggregation(aggregationType, 5000);
        const multiRanges = await rtsClient.multiRevRange(timestampRange, filter, undefined, aggregation, true);
        expect(Array.isArray(multiRanges)).toBe(true);

        const multiRange1 = multiRanges.shift();
        expect(multiRange1).not.toEqual(undefined);
        // @ts-ignore
        expect(multiRange1.key).toEqual("multirange3");
        // @ts-ignore
        const labels1 = multiRange1.labels;
        expect(labels1.shift()).toEqual(sensor2);
        expect(labels1.shift()).toEqual(sensor3);

        // @ts-ignore
        const samples = multiRange1.data;
        const sample1 = samples.shift();

        if (aggregationType === "count") {
            // @ts-ignore
            expect(sample1.getValue()).toEqual(0);
            // @ts-ignore
            expect(sample1.getTimestamp()).toEqual(date + 5000);
        } else {
            // @ts-ignore
            expect(sample1).toEqual(undefined);
        }

        expect(samples.length).toBe(0);
        expect(multiRanges.length).toBe(0);
    }
});
