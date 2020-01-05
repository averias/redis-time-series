import * as Redis from "ioredis";
import { RedisTimeSeries } from "./redisTimeSeries";
import { CommandInvoker, CommandProvider, CommandReceiver } from "./command";
import { RequestParamsBuilder, RequestParamsDirector } from "./request";
import { InfoResponseRender, MultiGetResponseRender, MultiRangeResponseRender } from "./response";

class RenderFactory {
    public getMultiRangeRender(): MultiRangeResponseRender {
        return new MultiRangeResponseRender();
    }

    public getMultiGetRender(): MultiGetResponseRender {
        return new MultiGetResponseRender();
    }

    public getInfoRender(): InfoResponseRender {
        return new InfoResponseRender();
    }
}

class RedisTimeSeriesFactory {
    protected options: Redis.RedisOptions = {
        port: 6379,
        host: "127.0.0.1",
        db: 0
    };

    constructor(options: Redis.RedisOptions = {}) {
        this.options = { ...this.options, ...options };
    }

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

export { RedisTimeSeriesFactory, RenderFactory };
