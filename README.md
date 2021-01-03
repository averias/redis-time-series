[![Test Coverage](https://api.codeclimate.com/v1/badges/f178828dd4e2cbaa32c5/test_coverage)](https://codeclimate.com/github/averias/redis-time-series/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/f178828dd4e2cbaa32c5/maintainability)](https://codeclimate.com/github/averias/redis-time-series/maintainability)
[![Build Status](https://travis-ci.org/averias/redis-time-series.svg?branch=master)](https://travis-ci.org/averias/redis-time-series)
[![npm version](https://badge.fury.io/js/redis-time-series-ts.svg)](https://badge.fury.io/js/redis-time-series-ts)
[![GitHub](https://img.shields.io/github/license/averias/redis-time-series.svg)](https://github.com/averias/redis-time-series)

# Redis-Time-Series
A Javascript client for [RedisLab/RedisTimeSeries Module](https://oss.redislabs.com/redistimeseries/) implemented in 
TypeScript and based on [ioredis](https://github.com/luin/ioredis)

## Requirements
- Redis server 4.0+ version (recommended version 5.0+)
- RedisTimeSeries Module installed on Redis server as specified in [Build and Run it yoursef](https://oss.redislabs.com/redistimeseries/#build-and-run-it-yourself)


## Install
`npm i redis-time-series-ts`


## Usage

```
import { Label } from "./entity/label";
import { RedisTimeSeriesFactory } from "./factory/redisTimeSeries";

const example = async () => {
    const factory = new RedisTimeSeriesFactory();
    const redisTimeSeries = factory.create();

    await redisTimeSeries.create("temperature", [new Label("sensor", 1)], 50000);

    const info = await redisTimeSeries.info("temperature");
    const label = info.labels.shift();

    if (label != null) {
        console.log(`label: ${label.getName()}=${label.getValue()}`); // label: sensor=1
    }

    console.log(`retention (ms): ${info.retentionTime}`); // retention (ms): 50000
    console.log(`last timestamp: ${info.lastTimestamp}`); // last timestamp: 0

    await redisTimeSeries.disconnect();
};

example();
```

If no param is provided to `RedisTimeSeries` constructor, it creates `RedsiTimeSeries` object with a default 
connection (port: 6379, host: "127.0.0.1" and database: 15). You can specify your connection params by providing an 
object of `ConnectionOptions` type (an IORedis `RedisOptions` type) which will overwrite those default connection params:

```
import { ConnectionOptions } from "./index";
import { RedisTimeSeriesFactory } from "./factory/redisTimeSeries";

const options: ConnectionOptions = {
    port: 6381,
    host: "127.0.0.1",
    db: 15
};

const factory = new RedisTimeSeriesFactory(options);
const redisTimeSeries = factory.create();
```

Take a look at the full [list of connections params](https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options) 
for IORedis.

## Commands
After creating a `RedisTimeSeries` from `RedisTimeSeries::create` you can issue the following async commands. 
All of them return a `Promise` if the command was executed successfully, otherwise, an `Error` will be thrown.

### `Create`
Creates a new time-series with an optional array of labels and optional retention. If the time-series `key` already
exists, an `Error` will be thrown.

```
redisTimeSeries.create(
    key: string, 
    labels?: Label[], 
    retention?: number, 
    chunkSize?: number,
    duplicatePolicy?: string
): Promise<boolean>
```

**Label**

It represents metadata labels of the time-series

`Label(name: string, value: string | number)`

**Response**

True if the time-series was created, otherwise false

**Example**

```
import { RedisTimeSeriesFactory } from "./factory/redisTimeSeries";
import { Label } from "./entity/label";

const example = async () => {
    const factory = new RedisTimeSeriesFactory();
    const redisTimeSeries = factory.create();

    const created = await redisTimeSeries.create("temperature", [new Label("sensor", 1)], 50000);
    console.log(created); // true

    const info = await redisTimeSeries.info("temperature");
    const label = info.labels.shift();

    if (label != null) {
        console.log(`label: ${label.getName()}=${label.getValue()}`); // label: sensor=1
    }

    await redisTimeSeries.disconnect();
};

example();
```

More info: [TS.CREATE](https://oss.redislabs.com/redistimeseries/commands/#tscreate)

### `Alter`
Updates the retention and labels of an existing time-series. Same params as `create`.

```
redisTimeSeries.alter(    
    key: string, 
    labels?: Label[], 
    retention?: number, 
    chunkSize?: number,
    duplicatePolicy?: string
): Promise<boolean>
```

- if time-series key doesn't exist an `Error` is thrown
- only provided params will be updated
- to remove all labels from an existing time-series, you must provide and empty Labels array

**Response**

True if the time-series was altered, otherwise false

**Example**

```
import { RedisTimeSeriesFactory } from "./factory/redisTimeSeries";
import { Label } from "./entity/label";

const example = async () => {
    const factory = new RedisTimeSeriesFactory({ port: 6381, db: 15 });
    const redisTimeSeries = factory.create();

    await redisTimeSeries.create("temperature", [new Label("sensor", 1)], 50000);

    const infoCreate = await redisTimeSeries.info("temperature");
    const labelCreate = infoCreate.labels.shift();

    if (labelCreate != null) {
        console.log(`label: ${labelCreate.getName()}=${labelCreate.getValue()}`); // label: sensor=1
    }

    console.log(`retention (ms): ${infoCreate.retentionTime}`); // retention (ms): 50000

    // labels are removed and retention is updated to 70000
    const altered = await redisTimeSeries.alter("temperature", [], 70000);
    console.log(altered); // true

    const infoAltered = await redisTimeSeries.info("temperature");
    const labelAltered = infoAltered.labels.shift();

    if (labelAltered != null) {
        // never executed since we removed labels
        console.log(`label: ${labelAltered.getName()}=${labelAltered.getValue()}`);
    }

    console.log(`retention (ms): ${infoAltered.retentionTime}`); // retention (ms): 70000

    await redisTimeSeries.delete("temperature");
    await redisTimeSeries.disconnect();
};

example();
```

More info: [TS.ALTER](https://oss.redislabs.com/redistimeseries/commands/#tsalter)

### `Add`
Appends, or first creates a time-series and then appends, a new value to the time-series.

```
redisTimeSeries.add(
    sample: Sample, 
    labels?: Label[], 
    retention?: number,
    chunkSize?: number,
    onDuplicate?: string
): Promise<number>
```

If this command is used to add data to an existing time-series, retentionTime and labels are ignored.

**Sample**

A sample represents the new value to be added where:
- `key`: is the time-series and
- `value`: the value to add
- `timestamp`: (optional) if it's provided, must be a valid timestamp and no older than the last one added. If it's omitted, it will store a string value `*`, which represents a current timestamp in Redis server

`Sample(key: string, value: number, timestamp?: number)`

**Response**

The timestamp value of the sample added

**Example**

```
import { RedisTimeSeriesFactory } from "./factory/redisTimeSeries";
import { Sample } from "./entity/sample";
import { Label } from "./entity/label";

const example = async () => {
    const factory = new RedisTimeSeriesFactory({ port: 6381, db: 15 });
    const redisTimeSeries = factory.create();
    const date = Date.now();

    let added = await redisTimeSeries.add(
        new Sample("temperature", 100, date - 10000),
        [new Label("sensor", 1)],
        50000
    );
    console.log(added); // date - 10000

    let info = await redisTimeSeries.info("temperature");
    let label = info.labels.shift();

    if (label != null) {
        console.log(`label: ${label.getName()}=${label.getValue()}`); // label: sensor=1
    }

    console.log(`retention (ms): ${info.retentionTime}`); // retention (ms): 50000

    let sample = await redisTimeSeries.get("temperature");
    console.log(`${sample.getKey()}`); // temperature
    console.log(`${sample.getValue()}`); // 100
    console.log(`${sample.getTimestamp()}`); // date - 10000

    // a new value is added, labels and retention are ignored since we added them previously
    added = await redisTimeSeries.add(
        new Sample("temperature", 500, date - 5000),
        [new Label("sensor", 2)],
        70000
    );
    console.log(added); // date - 5000

    info = await redisTimeSeries.info("temperature");
    label = info.labels.shift();

    if (label != null) {
        console.log(`label: ${label.getName()}=${label.getValue()}`); // still  sensor=1
    }

    console.log(`retention (ms): ${info.retentionTime}`); // still retention (ms): 50000

    sample = await redisTimeSeries.get("temperature");
    console.log(`${sample.getKey()}`); // temperature
    console.log(`${sample.getValue()}`); // 500
    console.log(`${sample.getTimestamp()}`); // date - 5000

    await redisTimeSeries.delete("temperature");
    await redisTimeSeries.disconnect();
};

example();
```

More info: [TS.ADD](https://oss.redislabs.com/redistimeseries/commands/#tsadd)

### `MultiAdd`
Similar to `Add` but it appends a list of new values to a time-series, the `key` specified in each sample must exist.

`redisTimeSeries.multiAdd(samples: Sample[]): Promise<(number | MultiAddResponseError)[]>`

**Response**

It returns an array of integers for each value added which is the timestamp specified in the sample, following the order 
the samples were added. If an error happens when the sample is added, instead of an integer and object of type `MultiAddResponseError`
will be returned:

```
type MultiAddResponseError = {
    stack: string;
    message: string;
};
``` 

**Example**

```
import { RedisTimeSeriesFactory } from "./factory/redisTimeSeries";
import { Label } from "./entity/label";
import { Sample } from "./entity/sample";
import { FilterBuilder } from "./builder/filterBuilder";

const example = async () => {
    const factory = new RedisTimeSeriesFactory({ port: 6381, db: 15 });
    const redisTimeSeries = factory.create();
    const date = Date.now();
    const label = new Label("sensor", 1);
    const sample1 = new Sample("temperature1", 100, date - 10000);
    const sample2 = new Sample("temperature2", 200, date - 5000);

    await redisTimeSeries.create("temperature1", [label]);
    await redisTimeSeries.create("temperature2", [label]);

    const multiAdded = await redisTimeSeries.multiAdd([sample1, sample2]);
    console.log(multiAdded[0]); // date - 10000
    console.log(multiAdded[1]); // date - 5000

    const multiGet = await redisTimeSeries.multiGet(new FilterBuilder("sensor", 1));
    const temperature1 = multiGet[0];
    const temperature2 = multiGet[1];

    console.log(`${temperature1.data.getKey()}`); // temperature1
    console.log(`${temperature1.data.getValue()}`); // 100
    console.log(`${temperature1.data.getTimestamp()}`); // date - 10000

    console.log(`${temperature2.data.getKey()}`); // temperature2
    console.log(`${temperature2.data.getValue()}`); // 200
    console.log(`${temperature2.data.getTimestamp()}`); // date - 5000

    await redisTimeSeries.delete("temperature1", "temperature2");
    await redisTimeSeries.disconnect();
};

example();
```

More info: [TS.MADD](https://oss.redislabs.com/redistimeseries/commands/#tsmadd)


### `incrementBy / decrementBy`
Increment or decrement the latest value in a time-series

`redisTimeSeries.incrementBy(sample: Sample, labels?: Label[], retention?: number, uncompressed?: boolean): Promise<number>`

`redisTimeSeries.decrementBy(sample: Sample, labels?: Label[], retention?: number, uncompressed?: boolean): Promise<number>`

You can use these command to add data to an non existing time-series, then `labels` and `retention` are ignored. By default, 
data are compressed in a time-series, you can revert this behavior by setting `uncompressed` to true

**Response**

The timestamp value of the sample incremented/decremented

**Example**

```
import { RedisTimeSeriesFactory } from "./factory/redisTimeSeries";
import { Label } from "./entity/label";
import { Sample } from "./entity/sample";

const example = async () => {
    const factory = new RedisTimeSeriesFactory({ port: 6381, db: 15 });
    const redisTimeSeries = factory.create();
    const date = Date.now();
    const label = new Label("sensor", 1);
    const sample1 = new Sample("temperature", 100, date - 10000);
    const sample2 = new Sample("temperature", 200, date - 5000);

    const increment = await redisTimeSeries.incrementBy(sample1, [label]);
    console.log(increment); // date - 10000

    let temperature = await redisTimeSeries.get("temperature");

    console.log(`${temperature.getKey()}`); // temperature
    console.log(`${temperature.getValue()}`); // 100
    console.log(`${temperature.getTimestamp()}`); // date - 10000

    const decrement = await redisTimeSeries.decrementBy(sample2, [label]);
    console.log(decrement); // date - 5000

    temperature = await redisTimeSeries.get("temperature");

    console.log(`${temperature.getKey()}`); // temperature
    console.log(`${temperature.getValue()}`); // -100
    console.log(`${temperature.getTimestamp()}`); // date - 5000

    await redisTimeSeries.delete("temperature");
    await redisTimeSeries.disconnect();
};

example();
```

More info: [TS.INCRBY / TS.DECRBY](https://oss.redislabs.com/redistimeseries/commands/#tsincrbytsdecrby)

### `CreateRule/DeleteRule`
it creates a compaction rule.

`redisTimeSeries.createRule(sourceKey: string, destKey: string, aggregation: Aggregation): Promise<boolean>`

Deletes a previous compaction rule.

`redisTimeSeries.deleteRule(sourceKey: string, destKey: string): Promise<boolean>`

Source and destination key must exist and be different

**Aggregation**

A aggregation represents a rule:
- `aggregationType`: avg, sum, min, max, range, count, first, last, std.p, std.s, var.p and var.s. See `AggregationType` enum
- `timeBucket`: a positive integer time bucket in milliseconds

`Aggregation(type: string, timeBucketInMs: number)`

**Response**

True if the aggregation rule was created/deleted, otherwise false

**Example**

```
import { RedisTimeSeriesFactory } from "./factory/redisTimeSeries";
import { Aggregation } from "./entity/aggregation";
import { AggregationType } from "./enum/aggregationType";

const example = async () => {
    const factory = new RedisTimeSeriesFactory({ port: 6381, db: 15 });
    const redisTimeSeries = factory.create();

    await redisTimeSeries.create("rule1");
    await redisTimeSeries.create("rule2");

    const aggregation = new Aggregation(AggregationType.AVG, 50000);
    const ruled = await redisTimeSeries.createRule("rule1", "rule2", aggregation);
    console.log(ruled); // true

    let info1 = await redisTimeSeries.info("rule1");
    console.log(info1.rules.rule2.getTimeBucketInMs()); // 50000
    console.log(info1.rules.rule2.getType()); // avg

    let info2 = await redisTimeSeries.info("rule2");
    console.log(info2.sourceKey); // rule1

    const deleted = await redisTimeSeries.deleteRule("rule1", "rule2");
    console.log(deleted); // true

    info1 = await redisTimeSeries.info("rule1");
    console.log(info1.rules); // {}}

    info2 = await redisTimeSeries.info("rule2");
    console.log(info2.sourceKey); // undefined

    await redisTimeSeries.delete("rule1", "rule2");
    await redisTimeSeries.disconnect();
};

example();
```

More info: 
- [TS.CREATERULE](https://oss.redislabs.com/redistimeseries/commands/#tscreaterule)
- [TS.DELETERULE](https://oss.redislabs.com/redistimeseries/commands/#tsdeleterule)

### `Range/ RevRange`
It queries a timestamp range.

`redisTimeSeries.range(key: string, range: TimestampRange, count?: number, aggregation?: Aggregation): Promise<Array<Sample>>`

- `range`: a `TimestampRange` object
- `count`: (optional) maximum number of returned samples per time-series
- `aggregation`: (optional) aggregation rule


**TimestampRange**

It represents a timestamp filter for the query:
- `from`: (optional) start timestamp value, if it's not specified or `undefined` represents the minimum possible timestamp (0)
- `to`: (optional) end timestamp value, if it's not specified or `undefined` represents the maximum possible timestamp (current timestamp in the Redis server)

`TimestampRange(from?: number, to?: number)`


**Response**

An array of samples which represent all the samples included in the query

**Example**

```
import { RedisTimeSeriesFactory } from "./factory/redisTimeSeries";
import { Sample } from "./entity/sample";
import { Aggregation } from "./entity/aggregation";
import { AggregationType } from "./enum/aggregationType";
import { TimestampRange } from "./entity/timestampRange";

const example = async () => {
    const factory = new RedisTimeSeriesFactory({ port: 6381, db: 15 });
    const redisTimeSeries = factory.create();
    const date = new Date(2020, 1, 6, 11).getTime();

    await redisTimeSeries.create("range1");
    for (let i = 0; i < 10; i++) {
        await redisTimeSeries.add(new Sample("range1", 20 + i, date + i * 1000));
    }

    const aggregation = new Aggregation(AggregationType.AVG, 1000);
    const timestampRange = new TimestampRange(date, date + 10000);
    const samples = await redisTimeSeries.range("range1", timestampRange, undefined, aggregation);

    for (const sample of samples) {
        console.log(sample.getKey()); // range1
        console.log(sample.getValue()); // >=20 and < 30
        console.log(sample.getTimestamp()); // between 1580983200000 and 1580983209000 timestamp values
    }

    await redisTimeSeries.delete("range1");
    await redisTimeSeries.disconnect();
};

example();
```

More info: [TS.RANGE](https://oss.redislabs.com/redistimeseries/commands/#tsrange)

### `MultiRange/MultiRevRange`
It queries a timestamp range across multiple time-series by using filters.

`redisTimeSeries.multiRange(range: TimestampRange, filters: FilterBuilder, count?: number, aggregation?: Aggregation, withLabels?: boolean): Promise<Array<MultiRangeResponse>>`

- `range`: a `TimestampRange` object
- `filters`: a `FilterBuilder` which will generate an array of filter to be applied across multiple time-series 
- `count`: (optional) maximum number of returned samples per time-series
- `aggregation`: (optional) aggregation rule
- `withLabels`: (optional) by default labels will be not included in the response, if true, they will


**FilterBuilder**

`FilterBuilder(label: string, value: string | number)`

The `label` and `value` in the constructor create a first filter where `label=value`. More filters can be created by 
calling the different methods in `FilterBuilder`:
- `equal(label: string, value: string | number)`: label=value
- `notEqual(label: string, value: string | number)`: label!=value
- `exists(label: string`: label exists in time-series
- `notExists(label: string`: label doesn't exist in time-series
- `in(label: string, value: StringNumberArray)`: where value is an array of strings and numbers, it specifies that label is equal to one of the values in the array
- `notIn(label: string, value: StringNumberArray)`: where value is an array of strings and numbers, it specifies that label is NOT equal to one of the values in the array

**Response**

An array of `MultiRangeResponse` objects

```
interface MultiRangeResponse {
    key: string;
    labels: Label[];
    data: Sample[];
}
```

if `withLabels` is true, `labels` in `MultiRangeResponse` will be empty.

If some of the keys returned by the filter doesn't include any sample because, for instance, the chosen timestamp range 
doesn't match `MultiRangeResponse.data` will still include one sample in the array with value = 0 and timestamp = first
timestamp found in the time-series which will be equel to 0 if the time-series has no data stored. 

**Example**

```
import { RedisTimeSeriesFactory } from "./factory/redisTimeSeries";
import { Label } from "./entity/label";
import { Sample } from "./entity/sample";
import { Aggregation } from "./entity/aggregation";
import { AggregationType } from "./enum/aggregationType";
import { TimestampRange } from "./entity/timestampRange";
import { FilterBuilder } from "./builder/filterBuilder";

const example = async () => {
    const factory = new RedisTimeSeriesFactory({ port: 6381, db: 15 });
    const redisTimeSeries = factory.create();
    const date = new Date(2020, 1, 6, 11).getTime();
    const label1 = new Label("label", "1");
    const sensor1 = new Label("sensor", "1");
    const sensor2 = new Label("sensor", "2");

    await redisTimeSeries.create("multirange1", [label1, sensor1]);
    await redisTimeSeries.create("multirange2", [label1, sensor2]);

    await redisTimeSeries.create("range1");
    for (let i = 0; i < 10; i++) {
        await redisTimeSeries.add(new Sample("multirange1", 20 + i, date + i * 1000));
        await redisTimeSeries.add(new Sample("multirange2", 30 + i, date + i * 1000));
    }

    const aggregation = new Aggregation(AggregationType.MAX, 5000);
    const timestampRange = new TimestampRange(date, date + 10000);
    const filter = new FilterBuilder("label", 1).equal("sensor", 1);
    const multiRanges = await redisTimeSeries.multiRange(timestampRange, filter, undefined, aggregation, true);

    const multiRange = multiRanges.shift();
    
    console.log(multiRange.key); //multirange1
    
    const labels = multiRange.labels;
    console.log(labels.shift()); // Label { name: 'label', value: '1' }
    console.log(labels.shift()); // Label { name: 'sensor', value: '1' }

    
    const samples = multiRange.data;
    
    console.log(samples.shift().getValue()); // 24
    
    console.log(samples.shift().getValue()); // 29;

    console.log(multiRanges.length); // 0

    await redisTimeSeries.delete("range1");
    await redisTimeSeries.disconnect();
};

example();
```

More info: [TS.MULTIRANGE](https://oss.redislabs.com/redistimeseries/commands/#tsmrange)

### `Get`
Get the last sample from an existing time-series.

`redisTimeSeries.get(key: string): Promise<Sample>`

**Response**

The last sample in the time-series specified by `key`

**Example**

```
import { RedisTimeSeriesFactory } from "./factory/redisTimeSeries";
import { Sample } from "./entity/sample";

const example = async () => {
    const factory = new RedisTimeSeriesFactory({ port: 6381, db: 15 });
    const redisTimeSeries = factory.create();
    const date = new Date(2020, 1, 6, 11).getTime();

    await redisTimeSeries.add(new Sample("get", 20, date));

    const sample = await redisTimeSeries.get("get");

    console.log(sample.getKey()); // get
    console.log(sample.getValue()); // 20
    console.log(sample.getTimestamp()); // 1580983200000;

    await redisTimeSeries.delete("get");
    await redisTimeSeries.disconnect();
};

example();
```

More info: [TS.GET](https://oss.redislabs.com/redistimeseries/commands/#tsget)

### `MultiGet`
Gets the last samples matching the specific filter.

`redisTimeSeries.multiGet(filters: FilterBuilder): Promise<Array<MultiGetResponse>>`

The `filters` param is a `FilterBuilder` which will generate an array of filters to be applied across multiple time-series 

**Response**

An array of `MultiGetResponse` objects

```
interface MultiRangeResponse {
    key: string;
    labels: Label[];
    data: Sample;
}
```

if `withLabels` is true, `labels` in `MultiRangeResponse` will be empty

If for a key returned because matches the filter but doesn't contain any data, `MultiGetResponse.data` will contain a 
sample with value = 0 and timestamp = 0;

**Example**

```
import { RedisTimeSeriesFactory } from "./factory/redisTimeSeries";
import { Label } from "./entity/label";
import { Sample } from "./entity/sample";
import { FilterBuilder } from "./builder/filterBuilder";

const example = async () => {
    const factory = new RedisTimeSeriesFactory({ port: 6381, db: 15 });
    const redisTimeSeries = factory.create();
    const date = new Date(2020, 1, 6, 11).getTime();
    const label1 = new Label("label", "1");
    const sensor1 = new Label("sensor", "1");
    const sensor2 = new Label("sensor", "2");

    await redisTimeSeries.create("multiget1", [label1, sensor1]);
    await redisTimeSeries.create("multiget2", [label1, sensor2]);

    for (let i = 0; i < 10; i++) {
        await redisTimeSeries.add(new Sample("multiget1", 20 + i, date + i * 1000));
        await redisTimeSeries.add(new Sample("multiget2", 30 + i, date + i * 1000));
    }

    const filter = new FilterBuilder("label", 1);
    const multiGets = await redisTimeSeries.multiGet(filter);

    const multiGet1 = multiGets.shift();
    console.log(multiGet1.key); // multiget1
    
    const labels1 = multiGet1.labels;
    console.log(labels1.shift()); // Label { name: 'label', value: '1' }
    console.log(labels1.shift()); // Label { name: 'sensor', value: '1' }
    
    const sample1 = multiGet1.data;
    
    console.log(sample1.getValue()); // 29
    console.log(sample1.getTimestamp()); // 1580983209000

    const multiGet2 = multiGets.shift();
    
    console.log(multiGet2.key); // multiget2
    
    const labels2 = multiGet2.labels;
    console.log(labels2.shift()); // Label { name: 'label', value: '1' }
    console.log(labels2.shift()); // Label { name: 'sensor', value: '2' }

    const sample2 = multiGet2.data;
    
    console.log(sample2.getValue()); // 39
    console.log(sample2.getTimestamp()); // 1580983209000

    await redisTimeSeries.delete("multiget1", "multiget2");
    await redisTimeSeries.disconnect();
};

example();
```

More info: [TS.MULTIGET](https://oss.redislabs.com/redistimeseries/commands/#tsmget)

### `QueryIndex`
Get all time-series keys matching the filter list.

`redisTimeSeries.mueryIndex(filters: FilterBuilder): Promise<string[]>`

The `filters` param is a `FilterBuilder` which will generate an array of filter to be applied across multiple time-series 

**Response**

An array of time-series keys

**Example**

```
import { RedisTimeSeriesFactory } from "./factory/redisTimeSeries";
import { Label } from "./entity/label";
import { Sample } from "./entity/sample";
import { FilterBuilder } from "./builder/filterBuilder";

const example = async () => {
    const factory = new RedisTimeSeriesFactory({ port: 6381, db: 15 });
    const redisTimeSeries = factory.create();
    const date = new Date(2020, 1, 6, 11).getTime();
    const label1 = new Label("label", "1");
    const sensor1 = new Label("sensor", "1");
    const sensor2 = new Label("sensor", "2");

    await redisTimeSeries.create("query1", [label1, sensor1]);
    await redisTimeSeries.create("query2", [label1, sensor2]);

    for (let i = 0; i < 10; i++) {
        await redisTimeSeries.add(new Sample("query1", 20 + i, date + i * 1000));
        await redisTimeSeries.add(new Sample("query2", 30 + i, date + i * 1000));
    }

    const filter = new FilterBuilder("label", 1);
    const keys = await redisTimeSeries.queryIndex(filter);

    // @ts-ignore
    console.log(keys.shift()); // query1
    // @ts-ignore
    console.log(keys.shift()); // query2

    await redisTimeSeries.delete("query1", "query2");
    await redisTimeSeries.disconnect();
};

example();
```

More info: [TS.QUERYINDEX](https://oss.redislabs.com/redistimeseries/commands/#tsqueryindex)

### `Info`
Returns information and statistics a time-series specified by `key`.

`redisTimeSeries.info(key: string): Promise<InfoResponse>`

**Response**

An `InfoResponse` object

```
interface InfoResponse {
    totalSamples: number;
    memoryUsage: number;
    firstTimestamp: number;
    lastTimestamp: number;
    retentionTime: number;
    chunkCount: number;
    chunkSize: number;
    chunkType: string;
    labels: Label[];
    duplicatePolicy: string;
    sourceKey?: string;
    rules: AggregationByKey;
}

interface AggregationByKey {
    [key: string]: Aggregation;
}
```

**Example**

```
import { RedisTimeSeriesFactory } from "./factory/redisTimeSeries";
import { Label } from "./entity/label";
import { Sample } from "./entity/sample";

const example = async () => {
    const factory = new RedisTimeSeriesFactory({ port: 6381, db: 15 });
    const redisTimeSeries = factory.create();
    const date = new Date(2020, 1, 6, 11).getTime();
    const label = new Label("label", "1");

    await redisTimeSeries.add(new Sample("info", 20, date), [label], 50000);

    const info = await redisTimeSeries.info("info");

    console.log(info.totalSamples); // 1
    console.log(info.memoryUsage); // 1
    console.log(info.firstTimestamp); // 1580983200000
    console.log(info.lastTimestamp); // 1580983200000
    console.log(info.retentionTime); // 50000
    console.log(info.sourceKey); // undefined
    console.log(info.labels.shift()); // Label { name: 'label', value: '1' }
    console.log(info.chunkSize); // 256
    console.log(info.chunkCount); // 1
    console.log(info.chunkType); // 'uncompressed'
    console.log(info.duplicatePolicy); // 'LAST'
    console.log(info.rules); // {}

    await redisTimeSeries.delete("info");
    await redisTimeSeries.disconnect();
};

example();
```

More info: [TS.INFO](https://oss.redislabs.com/redistimeseries/commands/#tsinfo)

### `Delete`
Deletes a time-series `key` by using Redis `del` command.

`redisTimeSeries.delete(key: string): Promise<boolean>`

**Response**

It returns `true` if the key was deleted successfully, otherwise `false`.

### `DeleteAll`
Deletes all keys in the current Redis database by using Redis `flushdb` command.

`redisTimeSeries.deleteAll(): Promise<boolean>`

**Response**

It returns `true` if all keys were deleted successfully, otherwise `false`.

### `Reset`
Resets a time-series `key` by deleting and then recreating the time-series with the labels and retention specified, if any.

`redisTimeSeries.reset(key: string, labels?: Label[], retention?: number): Promise<boolean>`

**Response**

It returns `true` if `key` was created successfully, otherwise `false`. If `key` doesn't exist or could not be deleted and 
error is thrown.

### `Disconnect`
Disconnects the `RedisTimeSeries` client from Redis server.

`redisTimeSeries.disconnect(): Promise<boolean>`

**Response**

It returns `true` if the client was disconnected successfully, otherwise `false`.


## Test
Tests can be run locally with docker. `docker.compose.yml` file will build two services:
- redis-time-series: node container with the source code and all dependent packages installed, where you can run the tests from
- redislabs-redistimeseries: redis container built from `redislabs/redistimeseries:latest` image

You can follow these steps to build the Docker services and run the tests:
- from the command line run: `docker-compose up --build -d` to build the Docker services
- get access to `redis-times-series` service by running `docker exec -it redis-time-series bash`
- after getting access to `redis-times-series` service, run `npm run test` from inside to run the tests


## License
Redis-time-series code is distributed under MIT license, see [LICENSE](https://github.com/averias/redis-time-series/blob/master/LICENSE) 
file
