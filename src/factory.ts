import * as Redis from "ioredis";
import { RedisTimeSeries } from "./redisTimeSeries";
import { CommandInvoker, CommandProvider, CommandReceiver } from "./command";
import { RequestParamsBuilder, RequestParamsDirector } from "./request";
import { InfoRender, MultiGetResponseRender, MultiRangeResponseRender } from "./response";

class RenderFactory {
    public getMultiRangeResponse(response: any[]): MultiRangeResponseRender {
        return new MultiRangeResponseRender(response);
    }

    public getMultiGetResponse(response: any[]): MultiGetResponseRender {
        return new MultiGetResponseRender(response);
    }

    public getInfo(response: any[]): InfoRender {
        return new InfoRender(response);
    }
}

class RedisTimeSeriesFactory {
    protected readonly client: Redis.Redis;
    protected options: Redis.RedisOptions = {
        port: 6379,
        host: "127.0.0.1",
        db: 0
    };

    constructor(options: Redis.RedisOptions | Redis.Redis = {}) {
        this.client = this.getClient(options);
    }

    public create(): RedisTimeSeries {
        const commandProvider: CommandProvider = new CommandProvider(this.client);
        const commandReceiver: CommandReceiver = new CommandReceiver(commandProvider.getClient());
        const director: RequestParamsDirector = new RequestParamsDirector(new RequestParamsBuilder());

        return new RedisTimeSeries(
            commandProvider,
            commandReceiver,
            new CommandInvoker(),
            director,
            new RenderFactory()
        );
    }

    protected getClient(options: Redis.RedisOptions | Redis.Redis): Redis.Redis {
        if (options instanceof Redis) {
            return options;
        }
        this.options = { ...this.options, ...options };

        return new Redis(this.options);
    }
}

export { RedisTimeSeriesFactory, RenderFactory };
