import { CommandEnum } from "./enum";
import { Label } from "./label";
import { Sample } from "./sample";
import { Aggregation } from "./aggregation";
import { TimestampRange } from "./timestampRange";
import { FilterBuilder } from "./filter";
import { MultiGetResponse, MultiRangeResponse, Info } from "./response";
import {
    CommandData,
    CommandInvoker,
    CommandProvider,
    CommandReceiver,
    DeleteCommand,
    DeleteAllCommand,
    TimeSeriesCommand
} from "./command";
import { RequestParamsDirector, StringNumberArray } from "./request";
import { RenderFactory } from "./factory";

export class RedisTimeSeries {
    protected readonly provider: CommandProvider;
    protected readonly receiver: CommandReceiver;
    protected readonly invoker: CommandInvoker;
    protected readonly director: RequestParamsDirector;
    protected readonly renderFactory: RenderFactory;

    constructor(
        provider: CommandProvider,
        receiver: CommandReceiver,
        invoker: CommandInvoker,
        director: RequestParamsDirector,
        renderFactory: RenderFactory
    ) {
        this.provider = provider;
        this.receiver = receiver;
        this.invoker = invoker;
        this.director = director;
        this.renderFactory = renderFactory;
    }

    public async create(key: string, labels?: Label[], retention?: number): Promise<boolean> {
        const params: StringNumberArray = this.director.create(key, labels, retention).get();
        const commandData: CommandData = this.provider.getCommandData(CommandEnum.CREATE, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return response === "OK";
    }

    public async alter(key: string, labels?: Label[], retention?: number): Promise<boolean> {
        const params: StringNumberArray = this.director.alter(key, labels, retention).get();
        const commandData: CommandData = this.provider.getCommandData(CommandEnum.ALTER, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return response === "OK";
    }

    public async add(sample: Sample, labels?: Label[], retention?: number): Promise<number> {
        const params: StringNumberArray = this.director.add(sample, labels, retention).get();
        const commandData: CommandData = this.provider.getCommandData(CommandEnum.ADD, params);

        return await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();
    }

    public async multiAdd(samples: Sample[]): Promise<number> {
        const params: StringNumberArray = this.director.multiAdd(samples).get();
        const commandData: CommandData = this.provider.getCommandData(CommandEnum.MADD, params);

        return await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();
    }

    public async incrementBy(sample: Sample, labels?: Label[], retention?: number): Promise<boolean> {
        return this.changeBy(CommandEnum.INCRBY, sample, labels, retention);
    }

    public async decrementBy(sample: Sample, labels?: Label[], retention?: number): Promise<boolean> {
        return this.changeBy(CommandEnum.DECRBY, sample, labels, retention);
    }

    public async createRule(sourceKey: string, destKey: string, aggregation: Aggregation): Promise<boolean> {
        const params: StringNumberArray = this.director.createRule(sourceKey, destKey, aggregation).get();
        const commandData: CommandData = this.provider.getCommandData(CommandEnum.CREATE_RULE, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return response === "OK";
    }

    public async deleteRule(sourceKey: string, destKey: string): Promise<boolean> {
        const params: StringNumberArray = this.director.deleteRule(sourceKey, destKey).get();
        const commandData: CommandData = this.provider.getCommandData(CommandEnum.DELETE_RULE, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return response === "OK";
    }

    public async range(
        key: string,
        range: TimestampRange,
        count?: number,
        aggregation?: Aggregation
    ): Promise<Array<Sample>> {
        const params: StringNumberArray = this.director.range(key, range, count, aggregation).get();
        const commandData: CommandData = this.provider.getCommandData(CommandEnum.RANGE, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        const samples: Sample[] = [];
        for (const sample of response) {
            samples.push(new Sample(key, Number(sample[1]), sample[0]));
        }

        return samples;
    }

    public async multiRange(
        range: TimestampRange,
        filters: FilterBuilder,
        count?: number,
        aggregation?: Aggregation
    ): Promise<Array<MultiRangeResponse>> {
        const params: StringNumberArray = this.director.multiRange(range, filters, count, aggregation).get();
        const commandData: CommandData = this.provider.getCommandData(CommandEnum.MULTI_RANGE, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return this.renderFactory.getMultiRangeResponse(response).render();
    }

    public async get(key: string): Promise<Sample> {
        const params: StringNumberArray = this.director.getKey(key).get();
        const commandData: CommandData = this.provider.getCommandData(CommandEnum.GET, params);
        const sample = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return new Sample(key, Number(sample[1]), sample[0]);
    }

    public async multiGet(filters: FilterBuilder): Promise<Array<MultiGetResponse>> {
        const params: StringNumberArray = this.director.multiGet(filters).get();
        const commandData: CommandData = this.provider.getCommandData(CommandEnum.MULTI_GET, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return this.renderFactory.getMultiGetResponse(response).render();
    }

    public async info(key: string): Promise<Info> {
        const params: StringNumberArray = this.director.getKey(key).get();
        const commandData: CommandData = this.provider.getCommandData(CommandEnum.INFO, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return this.renderFactory.getInfo(response).render();
    }

    public async queryIndex(filters: FilterBuilder): Promise<string[]> {
        const params: StringNumberArray = this.director.queryIndex(filters).get();
        const commandData: CommandData = this.provider.getCommandData(CommandEnum.QUERY_INDEX, params);
        return await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();
    }

    public async delete(...keys: string[]): Promise<boolean> {
        const response = await this.invoker.setCommand(new DeleteCommand(this.provider.getClient(), keys)).run();
        return response === 1;
    }

    public async deleteAll(): Promise<boolean> {
        await this.invoker.setCommand(new DeleteAllCommand(this.provider.getClient())).run();
        return true;
    }

    public async reset(key: string, labels?: Label[], retention?: number): Promise<boolean> {
        const deleted = await this.invoker.setCommand(new DeleteCommand(this.provider.getClient(), [key])).run();
        if (deleted !== 1) {
            throw new Error(`redis time series with key ${key} could not be deleted`);
        }

        const params: StringNumberArray = this.director.create(key, labels, retention).get();
        const commandData: CommandData = this.provider.getCommandData(CommandEnum.CREATE, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return response === "OK";
    }

    protected async changeBy(
        command: string,
        sample: Sample,
        labels: Label[] = [],
        retention?: number
    ): Promise<boolean> {
        const params: StringNumberArray = this.director.changeBy(sample, labels, retention).get();
        const commandData: CommandData = this.provider.getCommandData(command, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return response === "OK";
    }
}
