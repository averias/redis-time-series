import { Label } from "../../entity/label";
import { AggregationByKey } from "./aggregationByKey";

export interface InfoResponse {
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
