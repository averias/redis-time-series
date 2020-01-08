import { RequestParamsDirector } from "../../../builder/requestParamsDirector";
import { Label } from "../../../entity/label";
import { AggregationType } from "../../../enum/aggregationType";
import { CommandKeyword } from "../../../enum/commandKeyword";
import { Sample } from "../../../entity/sample";
import { Aggregation } from "../../../entity/aggregation";
import { TimestampRange } from "../../../entity/timestampRange";
import { FilterBuilder } from "../../../builder/filterBuilder";
import { RequestParamsBuilder } from "../../../builder/requestParamsBuilder";

let director: RequestParamsDirector;
let label1: Label;
let label2: Label;
let sample1: Sample;
let sample2: Sample;
let date: number;
let aggregation: Aggregation;
let timestampRange: TimestampRange;
let filterBuilder: FilterBuilder;

beforeAll(() => {
    date = Date.now();
    label1 = new Label("label1", 100);
    label2 = new Label("label2", 200);
    sample1 = new Sample("sample1", 10, date - 10000);
    sample2 = new Sample("sample2", 20, date - 20000);
    aggregation = new Aggregation(AggregationType.MAX, date);
    timestampRange = new TimestampRange(date - 20000, date - 10000);
    filterBuilder = new FilterBuilder("filter", 5);
});

beforeEach(() => {
    director = new RequestParamsDirector(new RequestParamsBuilder());
});

test("create with labels and retention", () => {
    expect(director.create("key", [label1, label2], 10000).get()).toEqual([
        "key",
        CommandKeyword.RETENTION,
        10000,
        CommandKeyword.LABELS,
        label1.getName(),
        label1.getValue(),
        label2.getName(),
        label2.getValue()
    ]);
});

test("create without retention", () => {
    expect(director.create("key", [label1, label2]).get()).toEqual([
        "key",
        CommandKeyword.LABELS,
        label1.getName(),
        label1.getValue(),
        label2.getName(),
        label2.getValue()
    ]);
});

test("create without labels", () => {
    expect(director.create("key", undefined, 10000).get()).toEqual(["key", CommandKeyword.RETENTION, 10000]);
});

test("create with empty labels", () => {
    expect(director.create("key", [], 10000).get()).toEqual(["key", CommandKeyword.RETENTION, 10000]);
});

test("create default", () => {
    expect(director.create("key").get()).toEqual(["key"]);
});

test("alter with labels and retention", () => {
    expect(director.alter("key", [label1, label2], 10000).get()).toEqual([
        "key",
        CommandKeyword.RETENTION,
        10000,
        CommandKeyword.LABELS,
        label1.getName(),
        label1.getValue(),
        label2.getName(),
        label2.getValue()
    ]);
});

test("alter without retention", () => {
    expect(director.alter("key", [label1, label2]).get()).toEqual([
        "key",
        CommandKeyword.LABELS,
        label1.getName(),
        label1.getValue(),
        label2.getName(),
        label2.getValue()
    ]);
});

test("alter without labels", () => {
    expect(director.alter("key", undefined, 10000).get()).toEqual(["key", CommandKeyword.RETENTION, 10000]);
});

test("alter with empty labels", () => {
    expect(director.alter("key", [], 10000).get()).toEqual([
        "key",
        CommandKeyword.RETENTION,
        10000,
        CommandKeyword.LABELS
    ]);
});

test("alter default", () => {
    expect(director.alter("key").get()).toEqual(["key"]);
});

test("add with labels and retention", () => {
    expect(director.add(sample1, [label1, label2], 10000).get()).toEqual([
        "sample1",
        date - 10000,
        10,
        CommandKeyword.RETENTION,
        10000,
        CommandKeyword.LABELS,
        label1.getName(),
        label1.getValue(),
        label2.getName(),
        label2.getValue()
    ]);
});

test("add without retention", () => {
    expect(director.add(sample1, [label1, label2]).get()).toEqual([
        "sample1",
        date - 10000,
        10,
        CommandKeyword.LABELS,
        label1.getName(),
        label1.getValue(),
        label2.getName(),
        label2.getValue()
    ]);
});

test("add without labels", () => {
    expect(director.add(sample1, undefined, 10000).get()).toEqual([
        "sample1",
        date - 10000,
        10,
        CommandKeyword.RETENTION,
        10000
    ]);
});

test("add with empty labels", () => {
    expect(director.add(sample1, [], 10000).get()).toEqual([
        "sample1",
        date - 10000,
        10,
        CommandKeyword.RETENTION,
        10000
    ]);
});

test("create default", () => {
    expect(director.add(sample1).get()).toEqual(["sample1", date - 10000, 10]);
});

test("multiadd", () => {
    expect(director.multiAdd([sample1, sample2]).get()).toEqual([
        "sample1",
        date - 10000,
        10,
        "sample2",
        date - 20000,
        20
    ]);
});

test("multiadd with empty labels", () => {
    expect(director.multiAdd([]).get().length).toEqual(0);
});

test("change by with labels and retention", () => {
    expect(director.changeBy(sample1, [label1, label2], 10000).get()).toEqual([
        "sample1",
        10,
        CommandKeyword.TIMESTAMP,
        date - 10000,
        CommandKeyword.RETENTION,
        10000,
        CommandKeyword.LABELS,
        label1.getName(),
        label1.getValue(),
        label2.getName(),
        label2.getValue()
    ]);
});

test("change by without retention", () => {
    expect(director.changeBy(sample1, [label1, label2]).get()).toEqual([
        "sample1",
        10,
        CommandKeyword.TIMESTAMP,
        date - 10000,
        CommandKeyword.LABELS,
        label1.getName(),
        label1.getValue(),
        label2.getName(),
        label2.getValue()
    ]);
});

test("change by without labels", () => {
    expect(director.changeBy(sample1, undefined, 10000).get()).toEqual([
        "sample1",
        10,
        CommandKeyword.TIMESTAMP,
        date - 10000,
        CommandKeyword.RETENTION,
        10000
    ]);
});

test("change by with empty labels", () => {
    expect(director.changeBy(sample1, [], 10000).get()).toEqual([
        "sample1",
        10,
        CommandKeyword.TIMESTAMP,
        date - 10000,
        CommandKeyword.RETENTION,
        10000
    ]);
});

test("change by default", () => {
    expect(director.changeBy(sample1).get()).toEqual(["sample1", 10, CommandKeyword.TIMESTAMP, date - 10000]);
});

test("create rule", () => {
    expect(director.createRule("source", "destination", aggregation).get()).toEqual([
        "source",
        "destination",
        CommandKeyword.AGGREGATION,
        AggregationType.MAX,
        date
    ]);
});

test("create rule with same source and destination fails", () => {
    expect(() => {
        director.createRule("key", "key", aggregation);
    }).toThrow(/source and destination key cannot be equals/);
});

test("delete rule", () => {
    expect(director.deleteRule("source", "destination").get()).toEqual(["source", "destination"]);
});

test("delete rule with same source and destination fails", () => {
    expect(() => {
        director.deleteRule("key", "key");
    }).toThrow(/source and destination key cannot be equals/);
});

test("range with count and aggregation", () => {
    expect(director.range("key", timestampRange, 3, aggregation).get()).toEqual([
        "key",
        date - 20000,
        date - 10000,
        CommandKeyword.COUNT,
        3,
        CommandKeyword.AGGREGATION,
        AggregationType.MAX,
        date
    ]);
});

test("range without aggregation", () => {
    expect(director.range("key", timestampRange, 3).get()).toEqual([
        "key",
        date - 20000,
        date - 10000,
        CommandKeyword.COUNT,
        3
    ]);
});

test("range without count", () => {
    expect(director.range("key", timestampRange, undefined, aggregation).get()).toEqual([
        "key",
        date - 20000,
        date - 10000,
        CommandKeyword.AGGREGATION,
        AggregationType.MAX,
        date
    ]);
});

test("range default", () => {
    expect(director.range("key", timestampRange).get()).toEqual(["key", date - 20000, date - 10000]);
});

test("multi range with count and aggregation", () => {
    expect(director.multiRange(timestampRange, filterBuilder, 3, aggregation).get()).toEqual([
        date - 20000,
        date - 10000,
        CommandKeyword.COUNT,
        3,
        CommandKeyword.AGGREGATION,
        AggregationType.MAX,
        date,
        CommandKeyword.FILTER,
        "filter=5"
    ]);
});

test("multi range without aggregation", () => {
    expect(director.multiRange(timestampRange, filterBuilder, 3).get()).toEqual([
        date - 20000,
        date - 10000,
        CommandKeyword.COUNT,
        3,
        CommandKeyword.FILTER,
        "filter=5"
    ]);
});

test("multi range without count", () => {
    expect(director.multiRange(timestampRange, filterBuilder, undefined, aggregation).get()).toEqual([
        date - 20000,
        date - 10000,
        CommandKeyword.AGGREGATION,
        AggregationType.MAX,
        date,
        CommandKeyword.FILTER,
        "filter=5"
    ]);
});

test("multi range default", () => {
    expect(director.multiRange(timestampRange, filterBuilder).get()).toEqual([
        date - 20000,
        date - 10000,
        CommandKeyword.FILTER,
        "filter=5"
    ]);
});

test("get key", () => {
    expect(director.getKey("key").get()).toEqual(["key"]);
});

test("multi get", () => {
    expect(director.multiGet(filterBuilder).get()).toEqual([CommandKeyword.FILTER, "filter=5"]);
});

test("query index", () => {
    expect(director.queryIndex(filterBuilder).get()).toEqual(["filter=5"]);
});
