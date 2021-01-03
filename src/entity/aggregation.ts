import { AggregationType } from "../enum/aggregationType";
import { CommandKeyword } from "../enum/commandKeyword";
import { StringNumberArray } from "../index";

/**
 * A `aggregation-type`-`timeBucket` object
 */
export class Aggregation {
    private readonly type: string;
    private readonly timeBucketInMs: number;

    /**
     * Creates a new Aggregation object
     *
     * @param type The type of aggregation e.g. AggregationType.AVG | AggregationType.SUM etc
     * @param timeBucketInMs The time bucket for the aggregation
     *
     * @remarks
     * // Example
     * ```
     * const aggregation = new Aggregation(AggregationType.AVG, 1000);
     * const timestampRange = new TimestampRange(date, date + 10000);
     * const samples = await redisTimeSeries.range("range1", timestampRange, undefined, aggregation);
     *
     * aggregation.getType() // avg
     * aggregation.getTimeBucketInMs() // 1000
     * aggregation.flatten() // ['AGGREGATION', 'avg', 1000]
     * ```
     */
    constructor(type: string, timeBucketInMs: number) {
        this.type = this.validateType(type);
        this.timeBucketInMs = this.validateTimeBucket(timeBucketInMs);
    }

    public getType(): string {
        return this.type;
    }

    public getTimeBucketInMs(): number {
        return this.timeBucketInMs;
    }

    public flatten(): StringNumberArray {
        return [CommandKeyword.AGGREGATION, this.getType(), this.getTimeBucketInMs()];
    }

    protected validateType(type: string): string {
        const keyEnum = Object.keys(AggregationType).find(key => AggregationType[key] === type.toLowerCase());
        if (keyEnum == null) {
            throw new Error(`aggregation type '${type}' not found`);
        }

        return AggregationType[keyEnum];
    }

    protected validateTimeBucket(timeBucketInMs: number): number {
        const truncatedTimeBucket = Math.trunc(timeBucketInMs);
        if (truncatedTimeBucket <= 0) {
            throw new Error(`invalid timestamp '${timeBucketInMs}'`);
        }

        return truncatedTimeBucket;
    }
}
