import { RedisTimeSeriesFactory } from "./factory/redisTimeSeries";
import { Label } from "./entity/label";
import { Sample } from "./entity/sample";
import { Count } from "./entity/count";
import { TimestampRange } from "./entity/timestampRange";
import { Aggregation } from "./entity/aggregation";
import { FilterOperator } from "./enum/filterOperator";
import { AggregationType } from "./enum/aggregationType";
import { FilterBuilder } from "./builder/filterBuilder";
import * as Redis from "ioredis";

type StringNumberArray = (string | number)[];
type ConnectionOptions = Redis.RedisOptions;

export {
    RedisTimeSeriesFactory,
    Label,
    Sample,
    Count,
    TimestampRange,
    Aggregation,
    AggregationType,
    FilterBuilder,
    FilterOperator,
    StringNumberArray,
    ConnectionOptions
};
