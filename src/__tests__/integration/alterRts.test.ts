import { Label } from "../../entity/label";
import { FilterBuilder } from "../../builder/filterBuilder";
import { testOptions } from "../../__tests_config__/data";
import { RedisTimeSeriesFactory } from "../../factory/redisTimeSeries";

const factory = new RedisTimeSeriesFactory(testOptions);
const rtsClient = factory.create();

beforeAll(async () => {
    await rtsClient.create("alter1");
});

afterAll(async () => {
    await rtsClient.delete("alter1");
    await rtsClient.disconnect();
});

test("alter labels successfully", async () => {
    const label = new Label("sensor1", "15");
    const altered = await rtsClient.alter("alter1", [label]);
    expect(altered).toEqual(true);

    const filter = new FilterBuilder("sensor1", "15");
    const indexes = await rtsClient.queryIndex(filter);
    expect(indexes.length).toBe(1);
    expect(indexes).toContain("alter1");

    const info = await rtsClient.info("alter1");
    expect(info.retentionTime).toEqual(0);

    const sensor1Label = info.labels.pop();
    expect(sensor1Label).toStrictEqual(label);
    expect(info.labels.length).toEqual(0);
});

test("alter retention and add label successfully", async () => {
    const label1 = new Label("sensor1", "15");
    const label2 = new Label("sensor2", "75");
    const altered = await rtsClient.alter("alter1", [label1, label2], 30000);
    expect(altered).toEqual(true);

    const filter1 = new FilterBuilder("sensor1", "15");
    const indexes1 = await rtsClient.queryIndex(filter1);
    expect(indexes1.length).toBe(1);
    expect(indexes1).toContain("alter1");

    const filter2 = new FilterBuilder("sensor2", "75");
    const indexes2 = await rtsClient.queryIndex(filter2);
    expect(indexes2.length).toBe(1);
    expect(indexes2).toContain("alter1");

    const allFilters = new FilterBuilder("sensor1", "15").equal("sensor2", "75");
    const indexes = await rtsClient.queryIndex(allFilters);
    expect(indexes.length).toBe(1);
    expect(indexes2).toContain("alter1");

    const info = await rtsClient.info("alter1");
    expect(info.retentionTime).toEqual(30000);

    expect(info.labels.length).toEqual(2);
    const sensor1Label2 = info.labels.pop();
    expect(sensor1Label2).toStrictEqual(label2);
    const sensor1Label1 = info.labels.pop();
    expect(sensor1Label1).toStrictEqual(label1);
});

test("alter retention and labels with no param doesn't change them", async () => {
    const label1 = new Label("sensor1", "15");
    const label2 = new Label("sensor2", "75");
    const altered = await rtsClient.alter("alter1");
    expect(altered).toEqual(true);

    const filter1 = new FilterBuilder("sensor1", "15");
    const indexes1 = await rtsClient.queryIndex(filter1);
    expect(indexes1.length).toBe(1);
    expect(indexes1).toContain("alter1");

    const filter2 = new FilterBuilder("sensor2", "75");
    const indexes2 = await rtsClient.queryIndex(filter2);
    expect(indexes2.length).toBe(1);
    expect(indexes2).toContain("alter1");

    const allFilters = new FilterBuilder("sensor1", "15").equal("sensor2", "75");
    const indexes = await rtsClient.queryIndex(allFilters);
    expect(indexes.length).toBe(1);
    expect(indexes2).toContain("alter1");

    const info = await rtsClient.info("alter1");
    expect(info.retentionTime).toEqual(30000);

    expect(info.labels.length).toEqual(2);
    const sensor1Label2 = info.labels.pop();
    expect(sensor1Label2).toStrictEqual(label2);
    const sensor1Label1 = info.labels.pop();
    expect(sensor1Label1).toStrictEqual(label1);
});

test("update labels successfully", async () => {
    const label = new Label("sensor3", "25");
    const altered = await rtsClient.alter("alter1", [label]);
    expect(altered).toEqual(true);

    const filter = new FilterBuilder("sensor3", "25");
    let indexes = await rtsClient.queryIndex(filter);
    expect(indexes.length).toBe(1);
    expect(indexes).toContain("alter1");

    const filter2 = new FilterBuilder("sensor2", "75");
    indexes = await rtsClient.queryIndex(filter2);
    expect(indexes.length).toBe(0);

    const filter3 = new FilterBuilder("sensor1", "15");
    indexes = await rtsClient.queryIndex(filter3);
    expect(indexes.length).toBe(0);

    const info = await rtsClient.info("alter1");

    expect(info.labels.length).toEqual(1);
    const sensor1Label = info.labels.pop();
    expect(sensor1Label).toStrictEqual(label);
});

test("remove labels successfully", async () => {
    const altered = await rtsClient.alter("alter1", []);
    expect(altered).toEqual(true);

    const info = await rtsClient.info("alter1");
    expect(info.retentionTime).toEqual(30000);

    expect(info.labels.length).toEqual(0);
});
