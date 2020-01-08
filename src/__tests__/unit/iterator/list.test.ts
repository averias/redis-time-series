import { Label } from "../../../entity/label";
import { List } from "../../../iterator/list";
import { Sample } from "../../../entity/sample";
import { Filter } from "../../../entity/filter";
import { FilterOperator } from "../../../enum/filterOperator";

test("label list", () => {
    const labelList: Label[] = [];
    for (let i = 1; i < 4; i++) {
        labelList.push(new Label("label" + i, i));
    }
    const flattenedLabelList = new List(labelList).flatten();
    for (let i = 1; i < 4; i++) {
        expect(flattenedLabelList.shift()).toEqual("label" + i);
        expect(flattenedLabelList.shift()).toEqual(i);
    }
    expect(flattenedLabelList.length).toBe(0);
});

test("sample list", () => {
    const sampleList: Sample[] = [];
    const date = new Date(2019, 11, 30, 19).getTime();
    for (let i = 1; i < 4; i++) {
        sampleList.push(new Sample("sample" + i, i, date + i));
    }
    const flattenedSampleList = new List(sampleList).flatten();
    for (let i = 1; i < 4; i++) {
        expect(flattenedSampleList.shift()).toEqual("sample" + i);
        expect(flattenedSampleList.shift()).toEqual(date + i);
        expect(flattenedSampleList.shift()).toEqual(i);
    }
    expect(flattenedSampleList.length).toBe(0);
});

test("filter list", () => {
    const filterList: Filter[] = [];
    for (let i = 1; i < 4; i++) {
        filterList.push(new Filter("filter" + i, FilterOperator.EQUAL, i));
    }
    const flattenedFilterList = new List(filterList).flatten();
    for (let i = 1; i < 4; i++) {
        expect(flattenedFilterList.shift()).toEqual(`filter${i}${FilterOperator.EQUAL}${i}`);
    }
    expect(flattenedFilterList.length).toBe(0);
});

test("combined list", () => {
    const label = new Label("label", 30);
    const sample = new Sample("sample", 50, 1000);
    const filter = new Filter("filter", FilterOperator.NOT_EQUAL, [1, 2]);
    const list: (Label | Sample | Filter)[] = [label, sample, filter];
    const flattenedList = new List(list).flatten();

    expect(flattenedList.shift()).toEqual("label");
    expect(flattenedList.shift()).toEqual(30);
    expect(flattenedList.shift()).toEqual("sample");
    expect(flattenedList.shift()).toEqual(1000);
    expect(flattenedList.shift()).toEqual(50);
    expect(flattenedList.shift()).toEqual(`filter${FilterOperator.NOT_EQUAL}(1,2)`);
    expect(flattenedList.length).toBe(0);
});
