import { Label } from "../entity/label";
import { Aggregation } from "../entity/aggregation";
import { InfoResponse } from "./interface/infoResponse";
import { AggregationByKey } from "./interface/aggregationByKey";

export class InfoResponseRender {
    public render(response: any[]): InfoResponse {
        const labels: Label[] = [];
        for (const label of response[19]) {
            labels.push(new Label(label[0], label[1]));
        }

        const rules: AggregationByKey = {};
        for (const rule of response[23]) {
            rules[rule[0]] = new Aggregation(rule[2], rule[1]);
        }

        const info: InfoResponse = {
            totalSamples: response[1],
            memoryUsage: response[3],
            firstTimestamp: response[5],
            lastTimestamp: response[7],
            retentionTime: response[9],
            chunkCount: response[11],
            chunkSize: response[13],
            chunkType: response[15],
            duplicatePolicy: response[17],
            labels: labels,
            sourceKey: response[21],
            rules: rules
        };

        if (response[21]) {
            info["sourceKey"] = response[21];
        }

        return info;
    }
}
