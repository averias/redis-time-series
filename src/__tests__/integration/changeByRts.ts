import { RedisTimeSeriesFactory } from "../../factory";
import { testOptions } from "../../__test_config__/data";
import { Sample } from "../../sample";
import { Label } from "../../label";

const factory = new RedisTimeSeriesFactory(testOptions);
const rtsClient = factory.create();

beforeAll(async () => {
    const sample = new Sample("change1", 20);
    await rtsClient.add(sample);
});

afterAll(async () => {
    await rtsClient.delete("change1", "change2", "change3");
});

test("increment successfully", async () => {
    const sample = new Sample("change1", 50);
    const incr = await rtsClient.incrementBy(sample);
    expect(incr).toEqual(true);

    const changed = await rtsClient.get("change1");
    expect(changed.getValue()).toEqual(70);
});

test("decrement successfully", async () => {
    const sample = new Sample("change1", 30);
    const decr = await rtsClient.decrementBy(sample);
    expect(decr).toEqual(true);

    const changed = await rtsClient.get("change1");
    expect(changed.getValue()).toEqual(40);
});

test("use increment for adding successfully", async () => {
    const sample = new Sample("change2", 50);
    const label = new Label("city1", "15");
    const incr = await rtsClient.incrementBy(sample, [label], 50000);
    expect(incr).toEqual(true);

    const changed = await rtsClient.get("change2");
    expect(changed.getValue()).toEqual(50);

    const info = await rtsClient.info("change2");
    expect(info.retentionTime).toEqual(50000);
    expect(info.labels.pop()).toEqual(label);
});

test("use decrement for adding successfully", async () => {
    const sample = new Sample("change3", 50);
    const label = new Label("city2", "75");
    const decr = await rtsClient.decrementBy(sample, [label], 70000);
    expect(decr).toEqual(true);

    const changed = await rtsClient.get("change3");
    expect(changed.getValue()).toEqual(-50);

    const info = await rtsClient.info("change3");
    expect(info.retentionTime).toEqual(70000);
    expect(info.labels.pop()).toEqual(label);
});
