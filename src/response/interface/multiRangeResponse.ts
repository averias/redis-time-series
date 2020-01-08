import { Sample } from "../../entity/sample";
import { BaseMultiResponse } from "./baseMultiResponse";

export interface MultiRangeResponse extends BaseMultiResponse {
    data: Sample[];
}
