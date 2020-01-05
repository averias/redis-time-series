import { CommandKeyword } from "./enum";
import { List } from "./list";
import { Label } from "./label";
import { Count } from "./count";
import { Aggregation } from "./aggregation";
import { TimestampRange } from "./timestampRange";
import { FilterBuilder } from "./filter";
import { Sample } from "./sample";

type StringNumberArray = (string | number)[];

class RequestParamsBuilder {
    private params: StringNumberArray;

    constructor() {
        this.reset();
    }

    public addKey(key: string): RequestParamsBuilder {
        this.params.push(key);
        return this;
    }

    public addKeys(sourceKey: string, destKey: string): RequestParamsBuilder {
        if (sourceKey === destKey) {
            throw new Error(`source and destination key cannot be equals: ${sourceKey} != ${destKey}`);
        }
        this.params.push(sourceKey, destKey);

        return this;
    }

    public addRetention(retention?: number): RequestParamsBuilder {
        if (retention != null) {
            if (retention < 0) {
                throw new Error(`retention must be positive integer, found: ${retention}`);
            }
            this.params.push(CommandKeyword.RETENTION, retention);
        }

        return this;
    }

    public addLabels(labels?: Label[]): RequestParamsBuilder {
        if (labels != null && labels.length !== 0) {
            const flatLabels = new List(labels).flatten();
            this.params.push(CommandKeyword.LABELS, ...flatLabels);
        }

        return this;
    }

    public removeLabels(): RequestParamsBuilder {
        this.params.push(CommandKeyword.LABELS);
        return this;
    }

    public addSamples(samples: Sample[]): RequestParamsBuilder {
        if (samples.length !== 0) {
            const flatSamples = new List(samples).flatten();
            this.params.push(...flatSamples);
        }

        return this;
    }

    public addSample(sample: Sample): RequestParamsBuilder {
        this.params.push(...sample.flatten());
        return this;
    }

    public addSampleWithOptionalTimeStamp(sample: Sample): RequestParamsBuilder {
        this.params.push(sample.getKey(), sample.getValue(), CommandKeyword.TIMESTAMP, sample.getTimestamp());
        return this;
    }

    public addCount(count?: number): RequestParamsBuilder {
        if (count != null) {
            this.params.push(...new Count(count).flatten());
        }

        return this;
    }

    public addAggregation(aggregation?: Aggregation): RequestParamsBuilder {
        if (aggregation != null) {
            this.params.push(...aggregation.flatten());
        }

        return this;
    }

    public addRange(range?: TimestampRange): RequestParamsBuilder {
        if (range != null) {
            this.params.push(...range.flatten());
        }

        return this;
    }

    public addFilters(filters: FilterBuilder): RequestParamsBuilder {
        const flatFilters = new List(filters.get()).flatten();
        this.params.push(...flatFilters);

        return this;
    }

    public addFiltersWithKeyword(filters: FilterBuilder): RequestParamsBuilder {
        const flatFilters = new List(filters.get()).flatten();
        this.params.push(CommandKeyword.FILTER, ...flatFilters);

        return this;
    }

    public addWithLabels(withLabels?: boolean): RequestParamsBuilder {
        if (withLabels != null && withLabels) {
            this.params.push(CommandKeyword.WITHLABELS);
        }

        return this;
    }

    public addUncompressed(uncompressed?: boolean): RequestParamsBuilder {
        if (uncompressed != null && uncompressed) {
            this.params.push(CommandKeyword.UNCOMPRESSED);
        }

        return this;
    }

    public reset(): RequestParamsBuilder {
        this.params = [];
        return this;
    }

    public get(): StringNumberArray {
        const params: StringNumberArray = this.params;
        this.reset();

        return params;
    }
}

class RequestParamsDirector {
    private paramsBuilder: RequestParamsBuilder;

    constructor(paramsBuilder: RequestParamsBuilder) {
        this.paramsBuilder = paramsBuilder;
    }

    public create(key: string, labels?: Label[], retention?: number): RequestParamsBuilder {
        return this.paramsBuilder
            .addKey(key)
            .addRetention(retention)
            .addLabels(labels);
    }

    public alter(key: string, labels?: Label[], retention?: number): RequestParamsBuilder {
        const builder = this.paramsBuilder.addKey(key).addRetention(retention);
        // if labels is an empty array it means deleting previous labels
        if (labels != null && labels.length === 0) {
            return builder.removeLabels();
        }

        return builder.addLabels(labels);
    }

    public add(sample: Sample, labels?: Label[], retention?: number): RequestParamsBuilder {
        return this.paramsBuilder
            .addSample(sample)
            .addRetention(retention)
            .addLabels(labels);
    }

    public multiAdd(samples: Sample[]): RequestParamsBuilder {
        return this.paramsBuilder.addSamples(samples);
    }

    public changeBy(
        sample: Sample,
        labels?: Label[],
        retention?: number,
        uncompressed?: boolean
    ): RequestParamsBuilder {
        return this.paramsBuilder
            .addSampleWithOptionalTimeStamp(sample)
            .addRetention(retention)
            .addLabels(labels)
            .addUncompressed(uncompressed);
    }

    public createRule(sourceKey: string, destKey: string, aggregation: Aggregation): RequestParamsBuilder {
        return this.paramsBuilder.addKeys(sourceKey, destKey).addAggregation(aggregation);
    }

    public deleteRule(sourceKey: string, destKey: string): RequestParamsBuilder {
        return this.paramsBuilder.addKeys(sourceKey, destKey);
    }

    public range(key: string, range: TimestampRange, count?: number, aggregation?: Aggregation): RequestParamsBuilder {
        return this.paramsBuilder
            .addKey(key)
            .addRange(range)
            .addCount(count)
            .addAggregation(aggregation);
    }

    public multiRange(
        range: TimestampRange,
        filters: FilterBuilder,
        count?: number,
        aggregation?: Aggregation,
        withLabels?: boolean
    ): RequestParamsBuilder {
        return this.paramsBuilder
            .addRange(range)
            .addCount(count)
            .addAggregation(aggregation)
            .addWithLabels(withLabels)
            .addFiltersWithKeyword(filters);
    }

    public getKey(key: string): RequestParamsBuilder {
        return this.paramsBuilder.addKey(key);
    }

    public multiGet(filters: FilterBuilder): RequestParamsBuilder {
        return this.paramsBuilder.addFiltersWithKeyword(filters);
    }

    public queryIndex(filters: FilterBuilder): RequestParamsBuilder {
        return this.paramsBuilder.addFilters(filters);
    }
}

export { StringNumberArray, RequestParamsBuilder, RequestParamsDirector };
