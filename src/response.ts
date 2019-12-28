import { Label } from "./label";
import { Sample } from "./sample";
import { Aggregation } from "./aggregation";

interface BaseMultiResponse {
    key: string;
    labels: Label[];
}

interface MultiRangeResponse extends BaseMultiResponse {
    key: string;
    labels: Label[];
    data: Sample[];
}

interface MultiGetResponse extends BaseMultiResponse {
    key: string;
    labels: Label[];
    data: Sample;
}

interface AggregationByKey {
    [key: string]: Aggregation;
}

interface Info {
    lastTimestamp: number;
    retentionTime: number;
    chunkCount: number;
    maxSamplesPerChunk: number;
    labels: Label[];
    sourceKey?: string;
    rules: AggregationByKey;
}

class MultiRangeResponseRender {
    protected response: any[];

    constructor(response: any[]) {
        this.response = response;
    }

    public render(): any[] {
        const ranges: MultiRangeResponse[] = [];
        for (const bucket of this.response) {
            const key = bucket[0];
            const labels: Label[] = [];
            for (const label of bucket[1]) {
                labels.push(new Label(label[0], label[1]));
            }
            const samples: Sample[] = [];
            for (const sample of bucket[2]) {
                const sampleValue = Number(sample[1]);
                samples.push(new Sample(key, isNaN(sampleValue) ? 0 : sampleValue, sample[0]));
            }
            ranges.push({
                key: key,
                labels: labels,
                data: samples
            });
        }

        return ranges;
    }
}

class MultiGetResponseRender {
    protected response: any[];

    constructor(response: any[]) {
        this.response = response;
    }

    public render(): any[] {
        const ranges: MultiGetResponse[] = [];
        for (const bucket of this.response) {
            const key = bucket[0];
            const labels: Label[] = [];
            for (const label of bucket[1]) {
                labels.push(new Label(label[0], label[1]));
            }
            const sample: Sample = new Sample(key, Number(bucket[3]), bucket[2]);
            ranges.push({
                key: key,
                labels: labels,
                data: sample
            });
        }

        return ranges;
    }
}

class InfoRender {
    protected response: any[];

    constructor(response: any[]) {
        this.response = response;
    }

    public render(): Info {
        const labels: Label[] = [];
        for (const label of this.response[9]) {
            labels.push(new Label(label[0], label[1]));
        }

        const rules: AggregationByKey = {};
        for (const rule of this.response[13]) {
            rules[rule[0]] = new Aggregation(rule[2], rule[1]);
        }

        const info: Info = {
            lastTimestamp: this.response[1],
            retentionTime: this.response[3],
            chunkCount: this.response[5],
            maxSamplesPerChunk: this.response[7],
            labels: labels,
            rules: rules
        };

        if (this.response[11]) {
            info["sourcekey"] = this.response[11];
        }

        return info;
    }
}

export {
    MultiRangeResponse,
    MultiGetResponse,
    AggregationByKey,
    Info,
    MultiRangeResponseRender,
    MultiGetResponseRender,
    InfoRender
};
