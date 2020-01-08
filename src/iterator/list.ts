import { Sample } from "../entity/sample";
import { Label } from "../entity/label";
import { Filter } from "../entity/filter";
import { StringNumberArray } from "../index";

export class List {
    private readonly list: (Label | Sample | Filter)[];

    constructor(list: (Label | Sample | Filter)[]) {
        this.list = list;
    }

    public flatten(): StringNumberArray {
        const result: StringNumberArray = [];
        for (const element of this.list) {
            result.push(...element.flatten());
        }

        return result;
    }
}
