import { CommandKeyword } from "../enum/commandKeyword";
import { StringNumberArray } from "../index";

/**
 * A `count` object representing the maximum number of results to return
 */
export class Count {
    private readonly count: number;

    /**
     * Creates a count object. Limits the number of items returned in a series
     *
     * @param count maximum number of results to return
     * ```
     *     // Example
     *     const count = new Count(5000)
     *     count.flatten() // ['COUNT', 5000]
     * ```
     */
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
