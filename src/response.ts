import { Label } from "./label";
import { Sample } from "./sample";
import { Aggregation } from "./aggregation";

interface AggregationByKey {
    [key: string]: Aggregation;
}

interface BaseMultiResponse {
    key: string;
    labels: Label[];
}

interface MultiRangeResponse extends BaseMultiResponse {
    data: Sample[];
}

interface MultiGetResponse extends BaseMultiResponse {
    data: Sample;
}

interface InfoResponse {
    totalSamples: number;
    memoryUsage: number;
    firstTimestamp: number;
    lastTimestamp: number;
    retentionTime: number;
    chunkCount: number;
    maxSamplesPerChunk: number;
    labels: Label[];
    sourceKey?: string;
    rules: AggregationByKey;
}

class MultiRangeResponseRender {
    public render(response: any[]): any[] {
        const ranges: MultiRangeResponse[] = [];
        for (const bucket of response) {
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
    public render(response: any[]): any[] {
        const ranges: MultiGetResponse[] = [];
        for (const bucket of response) {
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

class InfoResponseRender {
    public render(response: any[]): InfoResponse {
        const labels: Label[] = [];
        for (const label of response[15]) {
            labels.push(new Label(label[0], label[1]));
        }

        const rules: AggregationByKey = {};
        for (const rule of response[19]) {
            rules[rule[0]] = new Aggregation(rule[2], rule[1]);
        }

        const info: InfoResponse = {
            totalSamples: response[1],
            memoryUsage: response[3],
            firstTimestamp: response[5],
            lastTimestamp: response[7],
            retentionTime: response[9],
            chunkCount: response[11],
            maxSamplesPerChunk: response[13],
            labels: labels,
            rules: rules
        };

        if (response[17]) {
            info["sourceKey"] = response[17];
        }

        return info;
    }
}

export {
    AggregationByKey,
    MultiRangeResponse,
    MultiGetResponse,
    InfoResponse,
    MultiRangeResponseRender,
    MultiGetResponseRender,
    InfoResponseRender
};
