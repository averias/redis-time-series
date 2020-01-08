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
