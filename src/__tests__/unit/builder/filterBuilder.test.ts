import { FilterOperator } from "../../../enum/filterOperator";
import { Filter } from "../../../entity/filter";
import { FilterBuilder } from "../../../builder/filterBuilder";

test("all filter creation", () => {
    const filterBuilder = new FilterBuilder("label1", 21);
    const filters = filterBuilder
        .equal("label2", "22")
        .notEqual("label3", 23)
        .exists("label4")
        .notExists("label5")
        .in("label6", [24, "25"])
        .notIn("label7", ["26", 27])
        .get();

    expect(filters.shift()).toEqual(new Filter("label1", FilterOperator.EQUAL, 21));
    expect(filters.shift()).toEqual(new Filter("label2", FilterOperator.EQUAL, "22"));
    expect(filters.shift()).toEqual(new Filter("label3", FilterOperator.NOT_EQUAL, 23));
    expect(filters.shift()).toEqual(new Filter("label4", FilterOperator.NOT_EQUAL));
    expect(filters.shift()).toEqual(new Filter("label5", FilterOperator.EQUAL));
    expect(filters.shift()).toEqual(new Filter("label6", FilterOperator.EQUAL, [24, "25"]));
    expect(filters.shift()).toEqual(new Filter("label7", FilterOperator.NOT_EQUAL, ["26", 27]));
    expect(filters.length).toEqual(0);
});
