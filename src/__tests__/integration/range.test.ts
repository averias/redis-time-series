import { RedisTimeSeriesFactory } from "../../factory/redisTimeSeries";
import { testOptions } from "../../__tests_config__/data";
import { Sample } from "../../entity/sample";
import { Aggregation } from "../../entity/aggregation";
import { AggregationType } from "../../enum/aggregationType";
import { TimestampRange } from "../../entity/timestampRange";

const factory = new RedisTimeSeriesFactory(testOptions);
const rtsClient = factory.create();
const date = new Date(2019, 11, 24, 18).getTime();

beforeAll(async () => {
    await rtsClient.create("range1");
    for (let i = 0; i < 10; i++) {
        await rtsClient.add(new Sample("range1", 20 + i, date + i * 1000));
    }
});

afterAll(async () => {
    await rtsClient.delete("range1");
    await rtsClient.disconnect();
});

test("average aggregated query full range successfully", async () => {
    const aggregation = new Aggregation(AggregationType.AVG, 1000);
    const timestampRange = new TimestampRange(date, date + 10000);
    const samples = await rtsClient.range("range1", timestampRange, undefined, aggregation);
    expect(Array.isArray(samples)).toBe(true);
    let j = 0;
    for (const sample of samples) {
        const expectedSample = new Sample("range1", 20 + j, date + j * 1000);
        expect(sample).toEqual(expectedSample);
        j++;
    }
});

test("sum aggregated query full range successfully", async () => {
    const aggregation = new Aggregation(AggregationType.SUM, 5000);
    const timestampRange = new TimestampRange(date, date + 10000);
    const samples = await rtsClient.range("range1", timestampRange, undefined, aggregation);
    expect(Array.isArray(samples)).toBe(true);

    const expectedSample1 = new Sample("range1", 110, date);
    expect(samples[0]).toEqual(expectedSample1);

    const expectedSample2 = new Sample("range1", 135, date + 5000);
    expect(samples[1]).toEqual(expectedSample2);
});

test("min aggregated query full range successfully", async () => {
    const aggregation = new Aggregation(AggregationType.MIN, 5000);
    const timestampRange = new TimestampRange(date, date + 10000);
    const samples = await rtsClient.range("range1", timestampRange, undefined, aggregation);
    expect(Array.isArray(samples)).toBe(true);

    const expectedSample1 = new Sample("range1", 20, date);
    expect(samples[0]).toEqual(expectedSample1);

    const expectedSample2 = new Sample("range1", 25, date + 5000);
    expect(samples[1]).toEqual(expectedSample2);
});

test("std.p aggregated query full range successfully", async () => {
    const aggregation = new Aggregation(AggregationType.STD_P, 5000);
    const timestampRange = new TimestampRange(date, date + 10000);
    const samples = await rtsClient.range("range1", timestampRange, undefined, aggregation);
    expect(Array.isArray(samples)).toBe(true);

    expect(samples[0].getValue()).toBeCloseTo(1.4142);
    expect(samples[1].getValue()).toBeCloseTo(1.4142);
});

test("last aggregated query full range successfully with count", async () => {
    const aggregation = new Aggregation(AggregationType.LAST, 5000);
    const timestampRange = new TimestampRange(date, date + 10000);
    const samples = await rtsClient.range("range1", timestampRange, 1, aggregation);
    expect(Array.isArray(samples)).toBe(true);

    const expectedSample1 = new Sample("range1", 24, date);
    expect(samples.pop()).toEqual(expectedSample1);

    expect(samples.length).toBe(0);
});

test("query range on non existent key fails", async () => {
    const timestampRange = new TimestampRange(date, date + 10000);
    await expect(rtsClient.range("range2", timestampRange)).rejects.toThrow();
});
