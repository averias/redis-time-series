import { RequestParamsBuilder } from "../../request";
import { CommandKeyword } from "../../enum";

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
