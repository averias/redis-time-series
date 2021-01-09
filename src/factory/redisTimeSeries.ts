import * as Redis from "ioredis";
import { RedisTimeSeries } from "../redisTimeSeries";
import { RequestParamsDirector } from "../builder/requestParamsDirector";
import { RenderFactory } from "./render";
import { CommandProvider } from "../command/commandProvider";
import { CommandInvoker } from "../command/commandInvoker";
import { CommandReceiver } from "../command/commandReceiver";
import { RequestParamsBuilder } from "../builder/requestParamsBuilder";
import { ConnectionOptions } from "../index";

/**
 * Set redis connection options and return a factory object that create a clients connection
 */
export class RedisTimeSeriesFactory {
    protected options: ConnectionOptions = {
        port: 6379,
        host: "127.0.0.1",
        db: 0
    };

    /**
     * Set connection options
     *
     * @param options Connection options for the redis database
     * @returns factory object that can be used to create a client connection
     */
    constructor(options: ConnectionOptions = {}) {
        this.options = { ...this.options, ...options };
    }

    /**
     * Create a client connection to the host
     *
     * @returns The client connection object
     */
    public create(): RedisTimeSeries {
        const commandProvider: CommandProvider = new CommandProvider(this.getRedisClient());
        const commandReceiver: CommandReceiver = new CommandReceiver(commandProvider.getRTSClient());
        const director: RequestParamsDirector = new RequestParamsDirector(new RequestParamsBuilder());

        return new RedisTimeSeries(
            commandProvider,
            commandReceiver,
            new CommandInvoker(),
            director,
            new RenderFactory()
        );
    }

    protected getRedisClient(): Redis.Redis {
        return new Redis(this.options);
    }
}
