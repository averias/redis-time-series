import { Sample } from "./sample";
import { Label } from "./label";
import { Filter } from "./filter";
import { StringNumberArray } from "./request";

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
