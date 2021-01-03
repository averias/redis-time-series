import { Label } from "../../entity/label";
import { AggregationByKey } from "./aggregationByKey";

export interface InfoResponse {
    totalSamples: number;
    memoryUsage: number;
    firstTimestamp: number;
    lastTimestamp: number;
    retentionTime: number;
    chunkCount: number;
    chunkSize: number;
    chunkType: string;
    labels: Label[];
    duplicatePolicy: string;
    sourceKey?: string;
    rules: AggregationByKey;
}
