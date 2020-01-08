import { FilterOperator } from "../../../enum/filterOperator";
import { Filter } from "../../../entity/filter";

test("simple numeric filter creation", () => {
    const filter = new Filter("label", FilterOperator.EQUAL, 28);
    expect(filter.flatten()).toEqual([`label${FilterOperator.EQUAL}${28}`]);
});

test("simple string filter creation", () => {
    const filter = new Filter("label", FilterOperator.EQUAL, "28");
    expect(filter.flatten()).toEqual([`label${FilterOperator.EQUAL}${28}`]);
});

test("array filter creation", () => {
    const filter = new Filter("label", FilterOperator.NOT_EQUAL, ["28", 36, "limit"]);
    expect(filter.flatten()).toEqual([`label${FilterOperator.NOT_EQUAL}(28,36,limit)`]);
});

test("exist filter creation", () => {
    const filter = new Filter("label", FilterOperator.NOT_EQUAL);
    expect(filter.flatten()).toEqual([`label${FilterOperator.NOT_EQUAL}`]);
});

test("filter creation with wrong operator", () => {
    expect(() => {
        new Filter("label", ">");
    }).toThrow(/not allowed operator/);
});
