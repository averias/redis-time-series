import { CommandName } from "./enum/commandName";
import { Label } from "./entity/label";
import { Sample } from "./entity/sample";
import { Aggregation } from "./entity/aggregation";
import { TimestampRange } from "./entity/timestampRange";
import { FilterBuilder } from "./builder/filterBuilder";
import { DisconnectCommand } from "./command/disconnectCommand";
import { RequestParamsDirector } from "./builder/requestParamsDirector";
import { RenderFactory } from "./factory/render";
import { CommandData } from "./command/interface/commandData";
import { CommandProvider } from "./command/commandProvider";
import { CommandInvoker } from "./command/commandInvoker";
import { CommandReceiver } from "./command/commandReceiver";
import { TimeSeriesCommand } from "./command/timeSeriesCommand";
import { DeleteCommand } from "./command/deleteCommand";
import { DeleteAllCommand } from "./command/deleteAllCommand";
import { MultiAddResponseError } from "./response/type/multiAddResponseError";
import { MultiRangeResponse } from "./response/interface/multiRangeResponse";
import { MultiGetResponse } from "./response/interface/multiGetResponse";
import { InfoResponse } from "./response/interface/infoResponse";
import { StringNumberArray } from "./index";

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

    public async create(
        key: string,
        labels?: Label[],
        retention?: number,
        chunkSize?: number,
        duplicatePolicy?: string
    ): Promise<boolean> {
        const params: StringNumberArray = this.director
            .create(key, labels, retention, chunkSize, duplicatePolicy)
            .get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.CREATE, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return response === "OK";
    }

    public async alter(
        key: string,
        labels?: Label[],
        retention?: number,
        chunkSize?: number,
        duplicatePolicy?: string
    ): Promise<boolean> {
        const params: StringNumberArray = this.director.alter(key, labels, retention, chunkSize, duplicatePolicy).get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.ALTER, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return response === "OK";
    }

    public async add(
        sample: Sample,
        labels?: Label[],
        retention?: number,
        chunkSize?: number,
        onDuplicate?: string
    ): Promise<number> {
        const params: StringNumberArray = this.director.add(sample, labels, retention, chunkSize, onDuplicate).get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.ADD, params);

        return await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();
    }

    public async multiAdd(samples: Sample[]): Promise<(number | MultiAddResponseError)[]> {
        const params: StringNumberArray = this.director.multiAdd(samples).get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.MADD, params);

        return await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();
    }

    public async incrementBy(
        sample: Sample,
        labels?: Label[],
        retention?: number,
        uncompressed?: boolean,
        chunkSize?: number
    ): Promise<number> {
        return this.changeBy(CommandName.INCRBY, sample, labels, retention, uncompressed, chunkSize);
    }

    public async decrementBy(
        sample: Sample,
        labels?: Label[],
        retention?: number,
        uncompressed?: boolean,
        chunkSize?: number
    ): Promise<number> {
        return this.changeBy(CommandName.DECRBY, sample, labels, retention, uncompressed, chunkSize);
    }

    public async createRule(sourceKey: string, destKey: string, aggregation: Aggregation): Promise<boolean> {
        const params: StringNumberArray = this.director.createRule(sourceKey, destKey, aggregation).get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.CREATE_RULE, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return response === "OK";
    }

    public async deleteRule(sourceKey: string, destKey: string): Promise<boolean> {
        const params: StringNumberArray = this.director.deleteRule(sourceKey, destKey).get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.DELETE_RULE, params);
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
        const commandData: CommandData = this.provider.getCommandData(CommandName.RANGE, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        const samples: Sample[] = [];
        for (const sample of response) {
            samples.push(new Sample(key, Number(sample[1]), sample[0]));
        }

        return samples;
    }

    public async revRange(
        key: string,
        range: TimestampRange,
        count?: number,
        aggregation?: Aggregation
    ): Promise<Array<Sample>> {
        const params: StringNumberArray = this.director.range(key, range, count, aggregation).get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.REV_RANGE, params);
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
        aggregation?: Aggregation,
        withLabels?: boolean
    ): Promise<Array<MultiRangeResponse>> {
        const params: StringNumberArray = this.director
            .multiRange(range, filters, count, aggregation, withLabels)
            .get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.MULTI_RANGE, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return this.renderFactory.getMultiRangeRender().render(response);
    }

    public async multiRevRange(
        range: TimestampRange,
        filters: FilterBuilder,
        count?: number,
        aggregation?: Aggregation,
        withLabels?: boolean
    ): Promise<Array<MultiRangeResponse>> {
        const params: StringNumberArray = this.director
            .multiRange(range, filters, count, aggregation, withLabels)
            .get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.MULTI_REV_RANGE, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return this.renderFactory.getMultiRangeRender().render(response);
    }

    public async get(key: string): Promise<Sample> {
        const params: StringNumberArray = this.director.getKey(key).get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.GET, params);
        const sample = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return new Sample(key, Number(sample[1]), sample[0]);
    }

    public async multiGet(filters: FilterBuilder, withLabels?: boolean): Promise<Array<MultiGetResponse>> {
        const params: StringNumberArray = this.director.multiGet(filters, withLabels).get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.MULTI_GET, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return this.renderFactory.getMultiGetRender().render(response);
    }

    public async info(key: string): Promise<InfoResponse> {
        const params: StringNumberArray = this.director.getKey(key).get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.INFO, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return this.renderFactory.getInfoRender().render(response);
    }

    public async queryIndex(filters: FilterBuilder): Promise<string[]> {
        const params: StringNumberArray = this.director.queryIndex(filters).get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.QUERY_INDEX, params);
        return await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();
    }

    public async delete(...keys: string[]): Promise<boolean> {
        const response = await this.invoker.setCommand(new DeleteCommand(this.provider.getRTSClient(), keys)).run();
        return response === 1;
    }

    public async deleteAll(): Promise<boolean> {
        await this.invoker.setCommand(new DeleteAllCommand(this.provider.getRTSClient())).run();
        return true;
    }

    public async reset(key: string, labels?: Label[], retention?: number): Promise<boolean> {
        const deleted = await this.invoker.setCommand(new DeleteCommand(this.provider.getRTSClient(), [key])).run();
        if (deleted !== 1) {
            throw new Error(`redis time series with key ${key} could not be deleted`);
        }

        const params: StringNumberArray = this.director.create(key, labels, retention).get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.CREATE, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return response === "OK";
    }

    public async disconnect(): Promise<boolean> {
        const disconnected = await this.invoker.setCommand(new DisconnectCommand(this.provider.getRTSClient())).run();
        return disconnected === "OK";
    }

    protected async changeBy(
        command: string,
        sample: Sample,
        labels: Label[] = [],
        retention?: number,
        uncompressed?: boolean,
        chunkSize?: number
    ): Promise<number> {
        const params: StringNumberArray = this.director
            .changeBy(sample, labels, retention, uncompressed, chunkSize)
            .get();
        const commandData: CommandData = this.provider.getCommandData(command, params);

        return await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();
    }
}
