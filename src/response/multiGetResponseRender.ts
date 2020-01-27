import { Label } from "../entity/label";
import { Sample } from "../entity/sample";
import { MultiGetResponse } from "./interface/multiGetResponse";

export class MultiGetResponseRender {
    public render(response: any[]): any[] {
        const ranges: MultiGetResponse[] = [];
        for (const bucket of response) {
            const key = bucket[0];
            const labels: Label[] = [];
            for (const label of bucket[1]) {
                labels.push(new Label(label[0], label[1]));
            }
            let sampleValue = "0";
            let sampleTimestamp = 0;
            if (bucket[2].length !== 0) {
                sampleValue = bucket[2][1];
                sampleTimestamp = bucket[2][0];
            }
            ranges.push({
                key: key,
                labels: labels,
                data: new Sample(key, Number(sampleValue), sampleTimestamp)
            });
        }

        return ranges;
    }
}
