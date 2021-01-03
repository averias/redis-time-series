import { Sample } from "../entity/sample";
import { Label } from "../entity/label";
import { Filter } from "../entity/filter";
import { StringNumberArray } from "../index";

/**
 * An array that contains either Label, Sample or Filter objects
 */
export class List {
    private readonly list: (Label | Sample | Filter)[];

    /**
     * Creates a new List object containing either Label, Sample or Filter objects
     * @param list
     */
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
