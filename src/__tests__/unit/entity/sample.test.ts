import { Sample } from "../../../entity/sample";
import { CommandKeyword } from "../../../enum/commandKeyword";

test("sample creation with integer value and without timestamp", () => {
    const sample = new Sample("sample1", 34);
    expect(sample.getKey()).toEqual("sample1");
    expect(sample.getValue()).toEqual(34);
    expect(sample.getTimestamp()).toEqual(CommandKeyword.CURRENT_TIMESTAMP);
    expect(sample.flatten()).toEqual(["sample1", CommandKeyword.CURRENT_TIMESTAMP, 34]);
});

test("sample creation with float value and without timestamp", () => {
    const sample = new Sample("sample2", 34.76);
    expect(sample.getKey()).toEqual("sample2");
    expect(sample.getValue()).toEqual(34.76);
    expect(sample.getTimestamp()).toEqual(CommandKeyword.CURRENT_TIMESTAMP);
    expect(sample.flatten()).toEqual(["sample2", CommandKeyword.CURRENT_TIMESTAMP, 34.76]);
});

test("sample creation with valid timestamp", () => {
    const date = new Date(2019, 12, 28, 18).getTime();
    const sample = new Sample("sample3", 34, date);
    expect(sample.getKey()).toEqual("sample3");
    expect(sample.getValue()).toEqual(34);
    expect(sample.getTimestamp()).toEqual(date);
    expect(sample.flatten()).toEqual(["sample3", date, 34]);
});

test("sample creation with float timestamp truncate it", () => {
    const date = new Date(2019, 12, 28, 18).getTime() + 0.45;
    const sample = new Sample("sample4", 34, date);
    expect(sample.getTimestamp()).toEqual(Math.trunc(date));
});

test("sample creation with invalid timestamp fails", () => {
    expect(() => {
        new Sample("sample4", 34, -1);
    }).toThrow(/wrong timestamp/);
});
