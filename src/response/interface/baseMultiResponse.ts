import { Label } from "../../entity/label";

export interface BaseMultiResponse {
    key: string;
    labels: Label[];
}
