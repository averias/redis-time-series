import { CommandKeyword } from "../enum/commandKeyword";
import { List } from "../iterator/list";
import { Count } from "../entity/count";
import { TimestampRange } from "../entity/timestampRange";
import { StringNumberArray } from "../index";
import { Label } from "../entity/label";
import { Sample } from "../entity/sample";
import { Aggregation } from "../entity/aggregation";
import { FilterBuilder } from "./filterBuilder";

export class RequestParamsBuilder {
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

    public addChunkSize(chunkSize?: number): RequestParamsBuilder {
        if (chunkSize != null) {
            if (chunkSize < 0) {
                throw new Error(`chunkSize must be positive integer, found: ${chunkSize}`);
            }
            this.params.push(CommandKeyword.CHUNK_SIZE, chunkSize);
        }

        return this;
    }

    public addDuplicatePolicy(policy?: string): RequestParamsBuilder {
        if (policy != null) {
            if (![`BLOCK`, `FIRST`, `LAST`, `MIN`, `MAX`, `SUM`].includes(policy)) {
                throw new Error(
                    `duplicate policy must be either BLOCK, FIRST, LAST, MIN, MAX or SUM, found: ${policy}`
                );
            }
            this.params.push(CommandKeyword.DUPLICATE_POLICY, policy);
        }

        return this;
    }

    public addOnDuplicate(policy?: string): RequestParamsBuilder {
        if (policy != null) {
            if (![`BLOCK`, `FIRST`, `LAST`, `MIN`, `MAX`, `SUM`].includes(policy)) {
                throw new Error(
                    `duplicate policy must be either BLOCK, FIRST, LAST, MIN, MAX or SUM, found: ${policy}`
                );
            }
            this.params.push(CommandKeyword.ON_DUPLICATE, policy);
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
