import { RedisTimeSeriesFactory } from "./factory/redisTimeSeries";
import { Label } from "./entity/label";
import { Sample } from "./entity/sample";
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
    Aggregation,
    AggregationType,
    FilterBuilder,
    FilterOperator,
    StringNumberArray,
    ConnectionOptions
};
