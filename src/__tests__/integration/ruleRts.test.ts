import { RedisTimeSeriesFactory } from "../../factory/redisTimeSeries";
import { testOptions } from "../../__tests_config__/data";
import { Sample } from "../../entity/sample";
import { Aggregation } from "../../entity/aggregation";
import { AggregationType } from "../../enum/aggregationType";

const factory = new RedisTimeSeriesFactory(testOptions);
const rtsClient = factory.create();

beforeAll(async () => {
    const sample1 = new Sample("rule1", 20);
    const sample2 = new Sample("rule2", 30);
    await rtsClient.add(sample1);
    await rtsClient.add(sample2);
});

afterAll(async () => {
    await rtsClient.delete("rule1", "rule2");
    await rtsClient.disconnect();
});

test("create rule successfully", async () => {
    const aggregation = new Aggregation(AggregationType.AVG, 50000);
    const ruled = await rtsClient.createRule("rule1", "rule2", aggregation);
    expect(ruled).toEqual(true);

    const info1 = await rtsClient.info("rule1");
    expect(info1.rules.rule2).toEqual(aggregation);
    const info2 = await rtsClient.info("rule2");
    expect(info2.sourceKey).toEqual("rule1");
});

test("delete rule successfully", async () => {
    const ruled = await rtsClient.deleteRule("rule1", "rule2");
    expect(ruled).toEqual(true);

    const info = await rtsClient.info("rule1");
    expect(info.rules).toEqual({});
});

test("create rule with non existent destination key fails", async () => {
    const aggregation = new Aggregation(AggregationType.COUNT, 50000);
    await expect(rtsClient.createRule("rule1", "rule3", aggregation)).rejects.toThrow();
});

test("delete rule with non existent destination key fails", async () => {
    await expect(rtsClient.deleteRule("rule1", "rule3")).rejects.toThrow();
});

test("create rule with non existent source key fails", async () => {
    const aggregation = new Aggregation(AggregationType.COUNT, 50000);
    await expect(rtsClient.createRule("rule3", "rule2", aggregation)).rejects.toThrow();
});

test("delete rule with non existent source key fails", async () => {
    await expect(rtsClient.deleteRule("rule3", "rule2")).rejects.toThrow();
});

test("create rule with same source and destination key fails", async () => {
    const aggregation = new Aggregation(AggregationType.COUNT, 50000);
    await expect(rtsClient.createRule("rule1", "rule1", aggregation)).rejects.toThrow(
        /source and destination key cannot be equals/
    );
});
