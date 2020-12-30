import { RedisTimeSeriesFactory } from "../../factory/redisTimeSeries";
import { Label } from "../../entity/label";
import { FilterBuilder } from "../../builder/filterBuilder";
import { testOptions } from "../../__tests_config__/data";

const factory = new RedisTimeSeriesFactory(testOptions);
const rtsClient = factory.create();

afterAll(async () => {
    await rtsClient.delete(
        "create1",
        "create2",
        "create3",
        "create4",
        "create5",
        "create6",
        "create7",
        "create8",
        "create9"
    );
    await rtsClient.disconnect();
});

test("create time series successfully", async () => {
    const label = new Label("cpu1", "15");
    const created = await rtsClient.create("create1", [label], 50000);
    expect(created).toEqual(true);

    const filter = new FilterBuilder("cpu1", "15");
    const indexes = await rtsClient.queryIndex(filter);
    expect(indexes.length).toBe(1);
    expect(indexes).toContain("create1");

    const info = await rtsClient.info("create1");
    expect(info.retentionTime).toEqual(50000);

    const sensor1Label = info.labels.pop();
    expect(sensor1Label).toStrictEqual(label);
    expect(info.labels.length).toEqual(0);
});

test("create time series successfully without retention", async () => {
    const label = new Label("cpu2", "150");
    const created = await rtsClient.create("create2", [label]);
    expect(created).toEqual(true);

    const filter = new FilterBuilder("cpu2", "150");
    const indexes = await rtsClient.queryIndex(filter);
    expect(indexes.length).toBe(1);
    expect(indexes).toContain("create2");

    const info = await rtsClient.info("create2");
    expect(info.retentionTime).toEqual(0);

    const sensor1Label = info.labels.pop();
    expect(sensor1Label).toStrictEqual(label);
    expect(info.labels.length).toEqual(0);
});

test("create time series successfully without labels", async () => {
    const created = await rtsClient.create("create3", undefined, 3000);
    expect(created).toEqual(true);

    const info = await rtsClient.info("create3");
    expect(info.retentionTime).toEqual(3000);
    expect(info.labels.length).toEqual(0);
});

test("create time series successfully without optional params", async () => {
    const created = await rtsClient.create("create4");
    expect(created).toEqual(true);

    const info = await rtsClient.info("create4");
    expect(info.retentionTime).toEqual(0);
    expect(info.labels.length).toEqual(0);
});

test("create time series successfully with empty labels array", async () => {
    const created = await rtsClient.create("create5", []);
    expect(created).toEqual(true);

    const info = await rtsClient.info("create5");
    expect(info.retentionTime).toEqual(0);
    expect(info.labels.length).toEqual(0);
});

test("create time series successfully with valid chunk size and duplicate policy", async () => {
    const created = await rtsClient.create("create6", [], 3000, 8000, "FIRST");
    expect(created).toEqual(true);

    const info = await rtsClient.info("create6");
    expect(info.chunkSize).toEqual(8000);
    expect(info.duplicatePolicy).toEqual("first");
});

test("create duplicate time series fails", async () => {
    const label = new Label("cpu2", "17");
    await expect(rtsClient.create("create1", [label])).rejects.toThrow();
});

test("create time series with negative retention fails", async () => {
    const label = new Label("cpu1", "15");
    await expect(rtsClient.create("create7", [label], -10000)).rejects.toThrow(
        "retention must be positive integer, found: -10000"
    );
});

test("create time series with invalid chunk size", async () => {
    const label = new Label("cpu1", "15");
    await expect(rtsClient.create("create8", [label], undefined, -10000)).rejects.toThrow(
        "chunkSize must be positive integer, found: -10000"
    );
});

test("create time series with invalid duplication policy", async () => {
    const label = new Label("cpu1", "15");
    await expect(rtsClient.create("create9", [label], undefined, undefined, "HELLO")).rejects.toThrow(
        "duplicate policy must be either BLOCK, FIRST, LAST, MIN, MAX or SUM, found: HELLO"
    );
});
