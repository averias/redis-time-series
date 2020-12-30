import { Label } from "../entity/label";
import { Aggregation } from "../entity/aggregation";
import { TimestampRange } from "../entity/timestampRange";
import { FilterBuilder } from "./filterBuilder";
import { Sample } from "../entity/sample";
import { RequestParamsBuilder } from "./requestParamsBuilder";

class RequestParamsDirector {
    private paramsBuilder: RequestParamsBuilder;

    constructor(paramsBuilder: RequestParamsBuilder) {
        this.paramsBuilder = paramsBuilder;
    }

    public create(
        key: string,
        labels?: Label[],
        retention?: number,
        chunkSize?: number,
        duplicatePolicy?: string
    ): RequestParamsBuilder {
        return this.paramsBuilder
            .addKey(key)
            .addRetention(retention)
            .addLabels(labels)
            .addChunkSize(chunkSize)
            .addDuplicatePolicy(duplicatePolicy);
    }

    public alter(
        key: string,
        labels?: Label[],
        retention?: number,
        chunkSize?: number,
        duplicatePolicy?: string
    ): RequestParamsBuilder {
        const builder = this.paramsBuilder
            .addKey(key)
            .addRetention(retention)
            .addChunkSize(chunkSize)
            .addDuplicatePolicy(duplicatePolicy);
        // if labels is an empty array it means deleting previous labels
        if (labels != null && labels.length === 0) {
            return builder.removeLabels();
        }

        return builder.addLabels(labels);
    }

    public add(
        sample: Sample,
        labels?: Label[],
        retention?: number,
        chunkSize?: number,
        onDuplicate?: string
    ): RequestParamsBuilder {
        return this.paramsBuilder
            .addSample(sample)
            .addRetention(retention)
            .addLabels(labels)
            .addChunkSize(chunkSize)
            .addOnDuplicate(onDuplicate);
    }

    public multiAdd(samples: Sample[]): RequestParamsBuilder {
        return this.paramsBuilder.addSamples(samples);
    }

    public changeBy(
        sample: Sample,
        labels?: Label[],
        retention?: number,
        uncompressed?: boolean,
        chunkSize?: number
    ): RequestParamsBuilder {
        return this.paramsBuilder
            .addSampleWithOptionalTimeStamp(sample)
            .addRetention(retention)
            .addLabels(labels)
            .addUncompressed(uncompressed)
            .addChunkSize(chunkSize);
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

    public multiGet(filters: FilterBuilder, withLabels?: boolean): RequestParamsBuilder {
        return this.paramsBuilder.addWithLabels(withLabels).addFiltersWithKeyword(filters);
    }

    public queryIndex(filters: FilterBuilder): RequestParamsBuilder {
        return this.paramsBuilder.addFilters(filters);
    }
}

export { RequestParamsDirector };
