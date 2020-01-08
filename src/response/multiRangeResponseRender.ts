import { Label } from "../entity/label";
import { Sample } from "../entity/sample";
import { MultiRangeResponse } from "./interface/multiRangeResponse";

export class MultiRangeResponseRender {
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
