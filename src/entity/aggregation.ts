import { AggregationType } from "../enum/aggregationType";
import { CommandKeyword } from "../enum/commandKeyword";
import { StringNumberArray } from "../index";

export class Aggregation {
    private readonly type: string;
    private readonly timeBucketInMs: number;

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
