import { AggregationType } from "../../../enum/aggregationType";
import { CommandKeyword } from "../../../enum/commandKeyword";
import { Label } from "../../../entity/label";
import { Sample } from "../../../entity/sample";
import { Aggregation } from "../../../entity/aggregation";
import { TimestampRange } from "../../../entity/timestampRange";
import { FilterBuilder } from "../../../builder/filterBuilder";
import { RequestParamsBuilder } from "../../../builder/requestParamsBuilder";

let builder: RequestParamsBuilder;

beforeEach(() => {
    builder = new RequestParamsBuilder();
});

afterEach(() => {
    builder.reset();
});

test("add key", () => {
    expect(builder.addKey("key").get()).toEqual(["key"]);
});

test("add keys", () => {
    expect(builder.addKeys("source", "target").get()).toEqual(["source", "target"]);
});

test("add same keys fails", () => {
    expect(() => {
        builder.addKeys("source", "source").get();
    }).toThrow(/source and destination key cannot be equals/);
});

test("add retention", () => {
    expect(builder.addRetention(1000).get()).toEqual([CommandKeyword.RETENTION, 1000]);
});

test("add no retention", () => {
    expect(builder.addRetention().get().length).toEqual(0);
});

test("add negative retention fails", () => {
    expect(() => {
        builder.addRetention(-100).get();
    }).toThrow(/retention must be positive integer/);
});

test("add labels", () => {
    const labels = [new Label("label1", 100), new Label("label2", 200)];
    expect(builder.addLabels(labels).get()).toEqual([CommandKeyword.LABELS, "label1", 100, "label2", 200]);
});

test("add empty labels", () => {
    expect(builder.addLabels([]).get().length).toEqual(0);
});

test("add no labels", () => {
    expect(builder.addLabels().get().length).toEqual(0);
});

test("remove labels", () => {
    expect(builder.removeLabels().get()).toEqual([CommandKeyword.LABELS]);
});

test("add samples", () => {
    const date = Date.now();
    const samples = [new Sample("sample1", 100, date), new Sample("sample2", 200)];
    expect(builder.addSamples(samples).get()).toEqual(["sample1", date, 100, "sample2", "*", 200]);
});

test("add empty samples", () => {
    expect(builder.addSamples([]).get().length).toEqual(0);
});

test("add sample", () => {
    const date = Date.now();
    expect(builder.addSample(new Sample("sample1", 100, date)).get()).toEqual(["sample1", date, 100]);
});

test("add sample with optional timestamp", () => {
    const date = Date.now();
    expect(builder.addSampleWithOptionalTimeStamp(new Sample("sample1", 100, date)).get()).toEqual([
        "sample1",
        100,
        CommandKeyword.TIMESTAMP,
        date
    ]);
});

test("add count", () => {
    expect(builder.addCount(7).get()).toEqual([CommandKeyword.COUNT, 7]);
});

test("add no count", () => {
    expect(builder.addCount().get().length).toEqual(0);
});

test("add aggregation", () => {
    const date = Date.now();
    expect(builder.addAggregation(new Aggregation(AggregationType.MAX, date)).get()).toEqual([
        CommandKeyword.AGGREGATION,
        AggregationType.MAX,
        date
    ]);
});

test("add no aggregation", () => {
    expect(builder.addAggregation().get().length).toEqual(0);
});

test("add full range", () => {
    const date = Date.now();
    expect(builder.addRange(new TimestampRange(date - 10000, date)).get()).toEqual([date - 10000, date]);
});

test("add default left range", () => {
    const date = Date.now();
    expect(builder.addRange(new TimestampRange(undefined, date)).get()).toEqual([CommandKeyword.MIN_TIMESTAMP, date]);
});

test("add default right range", () => {
    const date = Date.now();
    expect(builder.addRange(new TimestampRange(date - 10000)).get()).toEqual([
        date - 10000,
        CommandKeyword.MAX_TIMESTAMP
    ]);
});

test("add full default range", () => {
    expect(builder.addRange(new TimestampRange()).get()).toEqual([
        CommandKeyword.MIN_TIMESTAMP,
        CommandKeyword.MAX_TIMESTAMP
    ]);
});

test("add no range", () => {
    expect(builder.addRange().get().length).toEqual(0);
});

test("add filters", () => {
    const filters = new FilterBuilder("filter1", 100);
    expect(builder.addFilters(filters).get()).toEqual(["filter1=100"]);
});

test("add filters with keyword", () => {
    const filters = new FilterBuilder("filter2", 200);
    expect(builder.addFiltersWithKeyword(filters).get()).toEqual([CommandKeyword.FILTER, "filter2=200"]);
});

test("reset", () => {
    expect(builder.reset().get().length).toEqual(0);
});
