import { CommandKeyword } from "../../../enum/commandKeyword";
import { TimestampRange } from "../../../entity/timestampRange";

test("timestamp range creation with default values", () => {
    const tsRange = new TimestampRange();
    expect(tsRange.getFrom()).toEqual(CommandKeyword.MIN_TIMESTAMP);
    expect(tsRange.getTo()).toEqual(CommandKeyword.MAX_TIMESTAMP);
    expect(tsRange.flatten()).toEqual([CommandKeyword.MIN_TIMESTAMP, CommandKeyword.MAX_TIMESTAMP]);
});

test("timestamp range creation with provided values", () => {
    const start = new Date(2019, 11, 29, 11).getTime();
    const end = start + 360000;
    const tsRange = new TimestampRange(start, end);
    expect(tsRange.getFrom()).toEqual(start);
    expect(tsRange.getTo()).toEqual(end);
    expect(tsRange.flatten()).toEqual([start, end]);
});

test("timestamp range creation with default from value", () => {
    const end = new Date(2019, 11, 29, 11).getTime() + 360000;
    const tsRange = new TimestampRange(undefined, end);
    expect(tsRange.getFrom()).toEqual(CommandKeyword.MIN_TIMESTAMP);
    expect(tsRange.getTo()).toEqual(end);
    expect(tsRange.flatten()).toEqual([CommandKeyword.MIN_TIMESTAMP, end]);
});

test("timestamp range creation with default to value", () => {
    const start = new Date(2019, 11, 29, 11).getTime();
    const tsRange = new TimestampRange(start);
    expect(tsRange.getFrom()).toEqual(start);
    expect(tsRange.getTo()).toEqual(CommandKeyword.MAX_TIMESTAMP);
    expect(tsRange.flatten()).toEqual([start, CommandKeyword.MAX_TIMESTAMP]);
});

test("timestamp range creation with invalid from value", () => {
    expect(() => {
        new TimestampRange(-1, Date.now());
    }).toThrow(/invalid timestamp/);
});

test("timestamp range creation with invalid to value", () => {
    expect(() => {
        new TimestampRange(Date.now(), -1);
    }).toThrow(/invalid timestamp/);
});
