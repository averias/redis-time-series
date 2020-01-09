import { RedisTimeSeriesFactory } from "../../../factory/redisTimeSeries";
import { CommandProvider } from "../../../command/commandProvider";
import { CommandReceiver } from "../../../command/commandReceiver";
import { RequestParamsDirector } from "../../../builder/requestParamsDirector";
import { RedisTimeSeries } from "../../../redisTimeSeries";
import * as Redis from "ioredis";
import { RequestParamsBuilder } from "../../../builder/requestParamsBuilder";
import { ConnectionOptions } from "../../../index";

jest.mock("../../../command/commandProvider");
jest.mock("../../../command/commandReceiver");
jest.mock("../../../builder/requestParamsDirector");
jest.mock("ioredis");

const options: ConnectionOptions = {
    port: 6379,
    host: "127.0.0.1",
    db: 0
};

it("Factory creates a RedisTimeSeries object", () => {
    const factory = new RedisTimeSeriesFactory();
    const redisTimeSeries = factory.create();

    expect(CommandProvider).toHaveBeenCalledTimes(1);
    expect(Redis).toHaveBeenCalledTimes(1);
    expect(Redis).toHaveBeenCalledWith(options);
    expect(CommandReceiver).toHaveBeenCalledTimes(1);
    expect(RequestParamsDirector).toHaveBeenCalledTimes(1);
    expect(RequestParamsDirector).toHaveBeenCalledWith(new RequestParamsBuilder());
    expect(redisTimeSeries).toBeInstanceOf(RedisTimeSeries);
});
