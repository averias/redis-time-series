import { Sample } from "../../entity/sample";
import { BaseMultiResponse } from "./baseMultiResponse";

export interface MultiGetResponse extends BaseMultiResponse {
    data: Sample;
}
