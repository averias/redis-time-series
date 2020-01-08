import { CommandKeyword } from "../enum/commandKeyword";
import { StringNumberArray } from "../index";

export class Count {
    private readonly count: number;

    constructor(count: number) {
        this.count = this.validate(count);
    }

    public flatten(): StringNumberArray {
        return [CommandKeyword.COUNT, this.count];
    }

    protected validate(count: number): number {
        const truncatedCount = Math.trunc(count);
        if (truncatedCount < 0) {
            throw new Error(`count must be positive, provided ${truncatedCount}`);
        }

        return truncatedCount;
    }
}
