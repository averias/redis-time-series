import { CommandKeyword } from "../enum/commandKeyword";
import { StringNumberArray } from "../index";

/**
 * A `from` - `to` timestamp object
 */
export class TimestampRange {
    private from: string | number;
    private to: string | number;

    /**
     *  Creates a timestamp range object
     *
     * @param from timestamp to begin from (milliseconds)
     * @param to timestamp to end at (milliseconds)
     *
     * @remarks
     * ```
     *     // Example
     *     const oneDayAgo = new Date().getTime() - 24 * 3600 * 1000
     *     const now = new Date().getTime()
     *     const tsRange = new TimestampRange(oneDayAgo, now)
     *     tsRange.getFrom() // oneDayAgo
     *     tsRange.getTo() // now
     *     tsRange.setFrom(oneDayAgo - 24 * 3600 * 1000) // twoDaysAgo
     *     tsRange.getTo(oneDayAgo) // oneDayAgo
     *     tsRange.flatten() // [twoDaysAgo, oneDayAgo]
     * ```
     */
    constructor(from?: number, to?: number) {
        this.setFrom(from);
        this.setTo(to);
    }

    public getFrom(): string | number {
        return this.from;
    }

    public setFrom(from?: number): TimestampRange {
        this.from = from == null ? CommandKeyword.MIN_TIMESTAMP : this.validateTimestamp(from);
        return this;
    }

    public getTo(): string | number {
        return this.to;
    }

    public setTo(to?: number): TimestampRange {
        this.to = to == null ? CommandKeyword.MAX_TIMESTAMP : this.validateTimestamp(to);
        return this;
    }

    public flatten(): StringNumberArray {
        return [this.getFrom(), this.getTo()];
    }

    protected validateTimestamp(timestamp: number): number {
        timestamp = Math.trunc(timestamp);
        if (new Date(timestamp).getTime() >= 0) {
            return timestamp;
        }

        throw new Error(`invalid timestamp ${timestamp}`);
    }
}
