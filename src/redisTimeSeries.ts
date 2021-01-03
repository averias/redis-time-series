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
    /**
     * Create a new time-series.
     *
     * Docs: [TS.CREATE](https://oss.redislabs.com/redistimeseries/commands/#tscreate)
     *
     * @param key Key name for timeseries
     * @param labels Array of Label objects (label-value pairs) that represent metadata labels of the key.
     * Use `new Label('label', value)` to create a new Label object
     * @param retention Maximum age for samples compared to last event time (in milliseconds).
     * Default: The global retention secs configuration of the database (by default, 0 ).
     * When set to 0, the series is not trimmed at all
     * @param chunkSize Amount of memory, in bytes, allocated for data. Default: 4000.
     * @param duplicatePolicy Configure what to do on duplicate sample.
     * https://oss.redislabs.com/redistimeseries/configuration/#DUPLICATE_POLICY
     *
     * When this is not set, the server-wide default will be used.
     *
     * - BLOCK - an error will occur for any out of order sample
     * - FIRST - ignore the new value
     * - LAST - override with latest value
     * - MIN - only override if the value is lower than the existing value
     * - MAX - only override if the value is higher than the existing value
     * @param uncompressed Cince version 1.2, both timestamps and values are compressed by default.
     * Adding this flag will keep data in an uncompressed form.
     * Compression not only saves memory but usually improve performance due to lower number of memory accesses.
     * @returns `true` if timeseries created successfully. `false` otherwise
     *
     * @remarks
     * Complexity -- O(1)
     */
    public async create(
        key: string,
        labels?: Label[],
        retention?: number,
        chunkSize?: number,
        duplicatePolicy?: string,
        uncompressed?: boolean
    ): Promise<boolean> {
        const params: StringNumberArray = this.director
            .create(key, labels, retention, chunkSize, duplicatePolicy, uncompressed)
            .get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.CREATE, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return response === "OK";
    }

    /**
     * Update the retention, labels of an existing key
     *
     * Docs: [TS.ALTER](https://oss.redislabs.com/redistimeseries/commands/#tsalter)
     *
     * @param key Key name for timeseries
     * @param labels Array of Label objects (label-value pairs) that represent metadata labels of the key.
     * Use `new Label('label', value)` to create a new Label object
     * @param retention Maximum age for samples compared to last event time (in milliseconds).
     * Default: The global retention secs configuration of the database (by default, 0 ).
     * When set to 0, the series is not trimmed at all
     * @param chunkSize Amount of memory, in bytes, allocated for data. Default: 4000.
     * @param duplicatePolicy Configure what to do on duplicate sample.
     * https://oss.redislabs.com/redistimeseries/configuration/#DUPLICATE_POLICY
     *
     * When this is not set, the server-wide default will be used.
     *
     * - BLOCK - an error will occur for any out of order sample
     * - FIRST - ignore the new value
     * - LAST - override with latest value
     * - MIN - only override if the value is lower than the existing value
     * - MAX - only override if the value is higher than the existing value
     * @param uncompressed Since version 1.2, both timestamps and values are compressed by default.
     * Adding this flag will keep data in an uncompressed form.
     * Compression not only saves memory but usually improve performance due to lower number of memory accesses.
     * @returns `true` if timeseries altered successfully. `false` otherwise
     */
    public async alter(
        key: string,
        labels?: Label[],
        retention?: number,
        chunkSize?: number,
        duplicatePolicy?: string,
        uncompressed?: boolean
    ): Promise<boolean> {
        const params: StringNumberArray = this.director
            .alter(key, labels, retention, chunkSize, duplicatePolicy, uncompressed)
            .get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.ALTER, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return response === "OK";
    }

    /**
     * Append (or create and append) a new sample to the series.
     *
     * Docs: [TS.ADD](https://oss.redislabs.com/redistimeseries/commands/#tsadd)
     *
     * @param sample The sample to add to the timeseries. Use `new Sample(key, timestamp, value)` to create it
     * @param labels Array of Label objects (label-value pairs) that represent metadata labels of the key.
     * Use `new Label('label', value)` to create a new Label object
     * @param retention Maximum age for samples compared to last event time (in milliseconds).
     * Default: The global retention secs configuration of the database (by default, 0 ).
     * When set to 0, the series is not trimmed at all
     * @param chunkSize Amount of memory, in bytes, allocated for data. Default: 4000.
     * @param duplicatePolicy Configure what to do on duplicate sample.
     * https://oss.redislabs.com/redistimeseries/configuration/#DUPLICATE_POLICY
     *
     * When this is not set, the server-wide default will be used.
     *
     * - BLOCK - an error will occur for any out of order sample
     * - FIRST - ignore the new value
     * - LAST - override with latest value
     * - MIN - only override if the value is lower than the existing value
     * - MAX - only override if the value is higher than the existing value
     * @param uncompressed Since version 1.2, both timestamps and values are compressed by default.
     * Adding this flag will keep data in an uncompressed form.
     * Compression not only saves memory but usually improve performance due to lower number of memory accesses.
     * @returns the timestamp of the added Sample
     *
     * @remarks
     * Complexity:
     *
     * If a compaction rule exits on a timeseries, TS.ADD performance might be reduced.
     * The complexity of TS.ADD is always O(M) when M is the amount of compaction rules or O(1) with no compaction.
     */
    public async add(
        sample: Sample,
        labels?: Label[],
        retention?: number,
        chunkSize?: number,
        onDuplicate?: string,
        uncompressed?: boolean
    ): Promise<number> {
        const params: StringNumberArray = this.director
            .add(sample, labels, retention, chunkSize, onDuplicate, uncompressed)
            .get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.ADD, params);

        return await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();
    }

    /**
     * Append new samples to a list of series.
     *
     * Docs: [TS.MADD](https://oss.redislabs.com/redistimeseries/commands/#tsmadd)
     *
     * @param samples The array of samples to add to the timeseries. Use `new Sample(key, timestamp, value)` to create a sample
     * @returns the timestamp of the added Samples
     *
     * @remarks
     * Complexity:
     *
     * If a compaction rule exits on a timeseries, multiAdd (TS.MADD) performance might be reduced.
     * The complexity of TS.MADD is always O(N*M) when N is the amount of series updated
     * and M is the amount of compaction rules or O(N) with no compaction.
     */
    public async multiAdd(samples: Sample[]): Promise<(number | MultiAddResponseError)[]> {
        const params: StringNumberArray = this.director.multiAdd(samples).get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.MADD, params);

        return await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();
    }

    /**
     * Creates a new sample that increments the latest sample's value.
     *
     * Docs: [TS.INCRBY](https://oss.redislabs.com/redistimeseries/commands/#tsincrbytsdecrby)
     *
     * @param sample The sample to add to the timeseries. Use `new Sample(key, timestamp, value)` to create it
     * @param labels Array of Label objects (label-value pairs) that represent metadata labels of the key.
     * Use `new Label('label', value)` to create a new Label object
     * @param retention Maximum age for samples compared to last event time (in milliseconds).
     * Default: The global retention secs configuration of the database (by default, 0 ).
     * When set to 0, the series is not trimmed at all
     * @param uncompressed Since version 1.2, both timestamps and values are compressed by default.
     * Adding this flag will keep data in an uncompressed form.
     * Compression not only saves memory but usually improve performance due to lower number of memory accesses.
     * @param chunkSize Amount of memory, in bytes, allocated for data. Default: 4000.
     *
     * @remarks
     * - You can use this command to add data to an non existing timeseries in a single command.
     * This is the reason why labels and retentionTime are optional arguments.
     *
     * - When specified and the key doesn't exist, RedisTimeSeries will create the key with the specified labels and or retentionTime .
     * Setting the labels and retentionTime introduces additional time complexity.
     */
    public async incrementBy(
        sample: Sample,
        labels?: Label[],
        retention?: number,
        uncompressed?: boolean,
        chunkSize?: number
    ): Promise<number> {
        return this.changeBy(CommandName.INCRBY, sample, labels, retention, uncompressed, chunkSize);
    }

    /**
     * Creates a new sample that decrements the latest sample's value.
     *
     * Docs: [TS.DECRBY](https://oss.redislabs.com/redistimeseries/commands/#tsincrbytsdecrby)
     *
     * @param sample The sample to add to the timeseries. Use `new Sample(key, timestamp, value)` to create it
     * @param labels Array of Label objects (label-value pairs) that represent metadata labels of the key.
     * Use `new Label('label', value)` to create a new Label object
     * @param retention Maximum age for samples compared to last event time (in milliseconds).
     * Default: The global retention secs configuration of the database (by default, 0 ).
     * When set to 0, the series is not trimmed at all
     * @param uncompressed Since version 1.2, both timestamps and values are compressed by default.
     * Adding this flag will keep data in an uncompressed form.
     * Compression not only saves memory but usually improve performance due to lower number of memory accesses.
     * @param chunkSize Amount of memory, in bytes, allocated for data. Default: 4000.
     *
     * @remarks
     * - You can use this command to add data to an non existing timeseries in a single command.
     * This is the reason why labels and retentionTime are optional arguments.
     *
     * - When specified and the key doesn't exist, RedisTimeSeries will create the key with the specified labels and or retentionTime .
     * Setting the labels and retentionTime introduces additional time complexity.
     */
    public async decrementBy(
        sample: Sample,
        labels?: Label[],
        retention?: number,
        uncompressed?: boolean,
        chunkSize?: number
    ): Promise<number> {
        return this.changeBy(CommandName.DECRBY, sample, labels, retention, uncompressed, chunkSize);
    }

    /**
     * Create a compaction rule.
     *
     * Docs: [TS.CREATERULE](https://oss.redislabs.com/redistimeseries/commands/#tscreaterule)
     *
     * @param sourceKey Key name for source time series
     * @param destKey Key name for destination time series
     * @param aggregation Aggregation Object -- avg, sum, min, max, range, count, first, last, std.p, std.s, var.p, var.s.
     * Create with `new Aggregation(type,timeBucketinMs)`
     * @returns `true` if rule created. `false` otherwise
     *
     * @remarks
     * - Currently, only new samples that are added into the source series after creation of the rule will be aggregated.
     * - `destKey` should be of a timeseries type, and should be created before `createRule` is called.
     */
    public async createRule(sourceKey: string, destKey: string, aggregation: Aggregation): Promise<boolean> {
        const params: StringNumberArray = this.director.createRule(sourceKey, destKey, aggregation).get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.CREATE_RULE, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return response === "OK";
    }

    /**
     * Delete a compaction rule.
     *
     * Docs: [TS.DELETERULE](https://oss.redislabs.com/redistimeseries/commands/#tsdeleterule)
     *
     * @param sourceKey Key name for source time series
     * @param destKey Key name for destination time series
     * @returns `true` if rule deleted. `false` otherwise
     */
    public async deleteRule(sourceKey: string, destKey: string): Promise<boolean> {
        const params: StringNumberArray = this.director.deleteRule(sourceKey, destKey).get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.DELETE_RULE, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return response === "OK";
    }

    /**
     * Query a range in the forward direction.
     *
     * Docs: [TS.RANGE](https://oss.redislabs.com/redistimeseries/commands/#tsrangetsrevrange)
     *
     * @param key Key name for timeseries
     * @param range A TimestampRange object. Contains Start and End timestamps for the range query.
     * Create with `new TimestampRange(from, to)`. Leave both params `from` and `to` as `undefined` i.e. `new TimestampRange()`
     * to express the minimum possible timestamp (`-`) and the maximum possible timestamp (`+`)
     * @param count Maximum number of returned results
     * @param aggregation Aggregation Object -- avg, sum, min, max, range, count, first, last, std.p, std.s, var.p, var.s.
     * Create with `new Aggregation(type,timeBucketinMs)`
     * @returns An array of `Sample` objects containing the timestamp and value
     *
     * @remarks
     * Complexity:
     *
     * TS.RANGE complexity is O(n/m+k).
     * n = Number of data points m = Chunk size (data points per chunk) k = Number of data points that are in the requested range.
     * This can be improved in the future by using binary search to find the start of the range, which makes this O(Log(n/m)+k*m).
     * But because m is pretty small, we can neglect it and look at the operation as O(Log(n) + k).
     */
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

    /**
     * Query a range in the reverse direction.
     *
     * Docs: [TS.REVRANGE](https://oss.redislabs.com/redistimeseries/commands/#tsrangetsrevrange)
     *
     * @param key Key name for timeseries
     * @param range A TimestampRange object. Contains Start and End timestamps for the range query.
     * Create with `new TimestampRange(from, to)`. Leave both params `from` and `to` as `undefined` i.e. `new TimestampRange()`
     * to express the minimum possible timestamp (`-`) and the maximum possible timestamp (`+`)
     * @param count Maximum number of returned results
     * @param aggregation Aggregation Object -- avg, sum, min, max, range, count, first, last, std.p, std.s, var.p, var.s.
     * Create with `new Aggregation(type,timeBucketinMs)`
     * @returns An array of `Sample` objects containing the timestamp and value
     *
     * @remarks
     * Complexity:
     *
     * TS.REVRANGE complexity is O(n/m+k).
     * n = Number of data points m = Chunk size (data points per chunk) k = Number of data points that are in the requested range.
     * This can be improved in the future by using binary search to find the start of the range, which makes this O(Log(n/m)+k*m).
     * But because m is pretty small, we can neglect it and look at the operation as O(Log(n) + k).
     */
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

    /**
     * Query a range across multiple time-series by filters in the forward direction.
     *
     * Docs: [TS.MRANGE](https://oss.redislabs.com/redistimeseries/commands/#tsmrangetsmrevrange)
     *
     * @param range A TimestampRange object. Contains Start and End timestamps for the range query.
     * Create with `new TimestampRange(from, to)`. Leave both params `from` and `to` as `undefined` i.e. `new TimestampRange()`
     * to express the minimum possible timestamp (`-`) and the maximum possible timestamp (`+`)
     * @param filters A filters object. Create with `new FilterBuilder(label, value)`. Chain methods to make more complex filters.
     * See docs on [filtering](https://oss.redislabs.com/redistimeseries/commands/#filtering)
     *
     * Examples:
     *
     * Filter timeseries with labels `device=raspberry_23` and `sensor=temperature_1`:
     * ```ts
     * const filter = new FilterBuilder("device", "raspberry_23").equal("sensor", "temperature_1");
     * ```
     * Methods that can be chained: `equal`,`notEqual`, `exists`, `notExists`, `in`, `notIn`
     *
     * See README for more examples on filter usage
     *
     * @param count Maximum number of returned results per time-series
     * @param aggregation Aggregation Object -- avg, sum, min, max, range, count, first, last, std.p, std.s, var.p, var.s.
     * Create with `new Aggregation(type,timeBucketinMs)`
     * @param withLabels Include in the reply the label-value pairs that represent metadata labels of the time-series.
     * If this argument is not set, by default, an empty Array will be replied on the labels array position.
     * @returns a promise containing an array of multi-range response objects i.e. `{ key: key, labels: Label[], data: Sample[] }`
     */
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

    /**
     * Query a range across multiple time-series by filters in the reverse direction.
     *
     * Docs: [TS.MREVRANGE](https://oss.redislabs.com/redistimeseries/commands/#tsmrangetsmrevrange)
     *
     * @param range A TimestampRange object. Contains Start and End timestamps for the range query.
     * Create with `new TimestampRange(from, to)`. Leave both params `from` and `to` as `undefined` i.e. `new TimestampRange()`
     * to express the minimum possible timestamp (`-`) and the maximum possible timestamp (`+`)
     * @param filters A filters object. Create with `new FilterBuilder(label, value)`. Chain methods to make more complex filters.
     * See docs on [filtering](https://oss.redislabs.com/redistimeseries/commands/#filtering)
     *
     * Examples:
     *
     * Filter timeseries with labels `device=raspberry_23` and `sensor=temperature_1`:
     * ```ts
     * const filter = new FilterBuilder("device", "raspberry_23").equal("sensor", "temperature_1");
     * ```
     * Methods that can be chained: `equal`,`notEqual`, `exists`, `notExists`, `in`, `notIn`
     *
     * See README for more examples on filter usage
     *
     * @param count Maximum number of returned results per time-series
     * @param aggregation Aggregation Object -- avg, sum, min, max, range, count, first, last, std.p, std.s, var.p, var.s.
     * Create with `new Aggregation(type,timeBucketinMs)`
     * @param withLabels Include in the reply the label-value pairs that represent metadata labels of the time-series.
     * If this argument is not set, by default, an empty Array will be replied on the labels array position.
     * @returns a promise containing an array of multi-range response objects i.e. `{ key: key, labels: Label[], data: Sample[] }`
     */
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

    /**
     * Get the last sample.
     *
     * Docs: [TS.GET](https://oss.redislabs.com/redistimeseries/commands/#tsget)
     *
     * @param key Key name for timeseries
     * @returns the Sample object containing the lastest sample
     */
    public async get(key: string): Promise<Sample> {
        const params: StringNumberArray = this.director.getKey(key).get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.GET, params);
        const sample = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return new Sample(key, Number(sample[1]), sample[0]);
    }

    /**
     * Get the last samples matching the specific filter.
     *
     * Docs: [TS.MGET](https://oss.redislabs.com/redistimeseries/commands/#tsmget)
     *
     * @param filters A filters object. Create with `new FilterBuilder(label, value)`. Chain methods to make more complex filters.
     * See docs on [filtering](https://oss.redislabs.com/redistimeseries/commands/#filtering)
     *
     * Examples:
     *
     * Filter timeseries with labels `device=raspberry_23` and `sensor=temperature_1`:
     * ```ts
     * const filter = new FilterBuilder("device", "raspberry_23").equal("sensor", "temperature_1");
     * ```
     * Methods that can be chained: `equal`,`notEqual`, `exists`, `notExists`, `in`, `notIn`
     *
     * See README for more examples on filter usage
     *
     * @param withLabels Include in the reply the label-value pairs that represent metadata labels of the time-series.
     * If this argument is not set, by default, an empty Array will be replied on the labels array position.
     * @returns An array of Sample objects containing the lastest samples across the specified series
     *
     * @remarks
     * TS.MGET complexity is O(n). n = Number of time-series that match the filters
     */
    public async multiGet(filters: FilterBuilder, withLabels?: boolean): Promise<Array<MultiGetResponse>> {
        const params: StringNumberArray = this.director.multiGet(filters, withLabels).get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.MULTI_GET, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return this.renderFactory.getMultiGetRender().render(response);
    }

    /**
     * Returns information and statistics on the time-series.
     *
     * Docs: [TS.INFO](https://oss.redislabs.com/redistimeseries/commands/#tsinfo)
     *
     * Complexity -- O(1)
     *
     * @param key Key name for timeseries
     * @returns An object containing information about the timeseries i.e.
     * ```
     * export interface InfoResponse {
     *   totalSamples: number;
     *   memoryUsage: number;
     *   firstTimestamp: number;
     *   lastTimestamp: number;
     *   retentionTime: number;
     *   chunkCount: number;
     *   chunkSize: number;
     *   chunkType: string;
     *   labels: Label[];
     *   duplicatePolicy: string;
     *   sourceKey?: string;
     *   rules: AggregationByKey;
     * }
     * ```
     */
    public async info(key: string): Promise<InfoResponse> {
        const params: StringNumberArray = this.director.getKey(key).get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.INFO, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return this.renderFactory.getInfoRender().render(response);
    }
    /**
     * Get all the keys matching the filter list.
     *
     * Docs: [TS.QUERYINDEX](https://oss.redislabs.com/redistimeseries/commands/#tsqueryindex)
     *
     * @param filters A filters object. Create with `new FilterBuilder(label, value)`. Chain methods to make more complex filters.
     * See docs on [filtering](https://oss.redislabs.com/redistimeseries/commands/#filtering)
     *
     * Examples:
     *
     * Filter timeseries with labels `device=raspberry_23` and `sensor=temperature_1`:
     * ```ts
     * const filter = new FilterBuilder("device", "raspberry_23").equal("sensor", "temperature_1");
     * ```
     * Methods that can be chained: `equal`,`notEqual`, `exists`, `notExists`, `in`, `notIn`
     *
     * See README for more examples on filter usage
     * @returns An array of keys matching the filters
     */
    public async queryIndex(filters: FilterBuilder): Promise<string[]> {
        const params: StringNumberArray = this.director.queryIndex(filters).get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.QUERY_INDEX, params);
        return await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();
    }

    /**
     * Delete the specified series
     *
     * Docs: [TS.DEL](https://oss.redislabs.com/redistimeseries/commands/#del)
     *
     * Note: Timeout can be set for a series using redis EXPIRE command when creating the series.
     *
     * @param keys An array of Keys for the series to be deleted
     * @returns `true` if Keys deleted. `false` otherwise
     */
    public async delete(...keys: string[]): Promise<boolean> {
        const response = await this.invoker.setCommand(new DeleteCommand(this.provider.getRTSClient(), keys)).run();
        return response === 1;
    }

    /**
     * Delete all series
     *
     * Note: This is an alias for the ioredis `flushdb()` command
     *
     * @param keys An array of Keys to be deleted
     * @returns `true` if all series deleted.
     */
    public async deleteAll(): Promise<boolean> {
        await this.invoker.setCommand(new DeleteAllCommand(this.provider.getRTSClient())).run();
        return true;
    }

    /**
     * Reset a timeseries i.e. `delete()` then `create()`. Takes the same arguments as `create()`
     *
     * @param key Key name for timeseries
     * @param labels Array of Label objects (label-value pairs) that represent metadata labels of the key.
     * Use `new Label('label', value)` to create a new Label object
     * @param retention Maximum age for samples compared to last event time (in milliseconds).
     * Default: The global retention secs configuration of the database (by default, 0 ).
     * When set to 0, the series is not trimmed at all
     * @param chunkSize Amount of memory, in bytes, allocated for data. Default: 4000.
     * @param duplicatePolicy Configure what to do on duplicate sample.
     * https://oss.redislabs.com/redistimeseries/configuration/#DUPLICATE_POLICY
     *
     * When this is not set, the server-wide default will be used.
     *
     * - BLOCK - an error will occur for any out of order sample
     * - FIRST - ignore the new value
     * - LAST - override with latest value
     * - MIN - only override if the value is lower than the existing value
     * - MAX - only override if the value is higher than the existing value
     * @param uncompressed Since version 1.2, both timestamps and values are compressed by default.
     * Adding this flag will keep data in an uncompressed form.
     * Compression not only saves memory but usually improve performance due to lower number of memory accesses.
     * @returns `true` if timeseries reset successfully. `false` otherwise
     */
    public async reset(
        key: string,
        labels?: Label[],
        retention?: number,
        chunkSize?: number,
        duplicatePolicy?: string,
        uncompressed?: boolean
    ): Promise<boolean> {
        const deleted = await this.invoker.setCommand(new DeleteCommand(this.provider.getRTSClient(), [key])).run();
        if (deleted !== 1) {
            throw new Error(`redis time series with key ${key} could not be deleted`);
        }

        const params: StringNumberArray = this.director
            .create(key, labels, retention, chunkSize, duplicatePolicy, uncompressed)
            .get();
        const commandData: CommandData = this.provider.getCommandData(CommandName.CREATE, params);
        const response = await this.invoker.setCommand(new TimeSeriesCommand(commandData, this.receiver)).run();

        return response === "OK";
    }

    /**
     * Disconnect from the client
     *
     * @returns `true` if client disconnected successfully. `false` otherwise
     */
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
