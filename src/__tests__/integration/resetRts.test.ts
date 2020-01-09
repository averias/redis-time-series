import { RedisTimeSeriesFactory } from "../../factory/redisTimeSeries";
import { Label } from "../../entity/label";
import { ConnectionOptions } from "../../index";

const options: ConnectionOptions = {
    host: "redislabs-redistimeseries",
    db: 14
};
const factory = new RedisTimeSeriesFactory(options);
const rtsClient = factory.create();

const sensor1 = new Label("sensor", "1");
const sensor2 = new Label("sensor", "2");
const sensor3 = new Label("sensor", "3");

beforeAll(async () => {
    await rtsClient.create("reset1", [sensor1], 50000);
    await rtsClient.create("reset2", [sensor2], 60000);
    await rtsClient.create("reset3", [sensor3], 70000);
});

afterAll(async () => {
    await rtsClient.deleteAll();
    await rtsClient.disconnect();
});

test("reset successfully", async () => {
    let info1 = await rtsClient.info("reset1");
    expect(info1.retentionTime).toEqual(50000);
    expect(info1.labels.shift()).toEqual(sensor1);

    let info2 = await rtsClient.info("reset2");
    expect(info2.retentionTime).toEqual(60000);
    expect(info2.labels.shift()).toEqual(sensor2);

    let info3 = await rtsClient.info("reset3");
    expect(info3.retentionTime).toEqual(70000);
    expect(info3.labels.shift()).toEqual(sensor3);

    const label1 = new Label("label", "1");
    const reset1 = await rtsClient.reset("reset1", [label1], 150000);
    expect(reset1).toEqual(true);

    const label2 = new Label("label", "2");
    const reset2 = await rtsClient.reset("reset2", [label2], 160000);
    expect(reset2).toEqual(true);

    const label3 = new Label("label", "3");
    const reset3 = await rtsClient.reset("reset3", [label3], 170000);
    expect(reset3).toEqual(true);

    info1 = await rtsClient.info("reset1");
    expect(info1.retentionTime).toEqual(150000);
    expect(info1.labels.shift()).not.toEqual(sensor1);

    info2 = await rtsClient.info("reset2");
    expect(info2.retentionTime).toEqual(160000);
    expect(info2.labels.shift()).not.toEqual(sensor2);

    info3 = await rtsClient.info("reset3");
    expect(info3.retentionTime).toEqual(170000);
    expect(info3.labels.shift()).not.toEqual(sensor3);
});

test("reset not existent key fails", async () => {
    await expect(rtsClient.reset("reset4")).rejects.toThrow(/redis time series with key reset4 could not be deleted/);
});
