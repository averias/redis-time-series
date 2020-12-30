import { Sample } from "../../../entity/sample";
import { RenderFactory } from "../../../factory/render";
import { Label } from "../../../entity/label";
import { AggregationType } from "../../../enum/aggregationType";
import { Aggregation } from "../../../entity/aggregation";
import { MultiRangeResponse } from "../../../response/interface/multiRangeResponse";
import { MultiGetResponse } from "../../../response/interface/multiGetResponse";
import { InfoResponse } from "../../../response/interface/infoResponse";

let renderFactory: RenderFactory;
const date = Date.now();

beforeAll(() => {
    renderFactory = new RenderFactory();
});

test("multi range response render", () => {
    const responseRender = renderFactory.getMultiRangeRender();
    const response = [
        [
            "key",
            [
                ["label1", 10],
                ["label2", 20]
            ],
            [
                [date - 10000, "10"],
                [date - 20000, 20],
                [date - 30000, "-nan"]
            ]
        ]
    ];
    const rendered: MultiRangeResponse = responseRender.render(response).shift();
    expect(rendered.key).toBe("key");

    const labels = rendered.labels;
    expect(labels.shift()).toEqual(new Label("label1", 10));
    expect(labels.shift()).toEqual(new Label("label2", 20));

    const samples = rendered.data;
    expect(samples.shift()).toEqual(new Sample("key", 10, date - 10000));
    expect(samples.shift()).toEqual(new Sample("key", 20, date - 20000));
    expect(samples.shift()).toEqual(new Sample("key", 0, date - 30000));
});

test("multi get response render", () => {
    const responseRender = renderFactory.getMultiGetRender();
    const response = [
        [
            "key",
            [
                ["label1", 10],
                ["label2", 20]
            ],
            [date - 10000, "10"]
        ]
    ];
    const rendered: MultiGetResponse = responseRender.render(response).shift();
    expect(rendered.key).toBe("key");

    const labels = rendered.labels;
    expect(labels.shift()).toEqual(new Label("label1", 10));
    expect(labels.shift()).toEqual(new Label("label2", 20));

    const sample = rendered.data;
    expect(sample).toEqual(new Sample("key", 10, date - 10000));
});

test("info response render without source key", () => {
    const responseRender = renderFactory.getInfoRender();
    const response = [
        "totalSamples",
        10,
        "memoryUsage",
        4209,
        "firstTimestamp",
        date - 10000,
        "lastTimestamp",
        date,
        "retentionTime",
        80000,
        "chunkCount",
        1,
        "chunkSize",
        360,
        "chunkType",
        "compressed",
        "duplicatePolicy",
        "LAST",
        "labels",
        [
            ["label1", 10],
            ["label2", 20]
        ],
        "sourceKey",
        undefined,
        "rules",
        [
            ["rule1", 45000, AggregationType.MAX],
            ["rule2", 75000, AggregationType.COUNT]
        ]
    ];
    const rendered: InfoResponse = responseRender.render(response);
    expect(rendered.totalSamples).toBe(10);
    expect(rendered.memoryUsage).toBe(4209);
    expect(rendered.firstTimestamp).toBe(date - 10000);
    expect(rendered.lastTimestamp).toBe(date);
    expect(rendered.retentionTime).toBe(80000);
    expect(rendered.chunkCount).toBe(1);
    expect(rendered.chunkSize).toBe(360);
    expect(rendered.chunkType).toBe("compressed");
    expect(rendered.duplicatePolicy).toBe("LAST");

    const labels = rendered.labels;
    expect(labels.shift()).toEqual(new Label("label1", 10));
    expect(labels.shift()).toEqual(new Label("label2", 20));

    const rules = rendered.rules;
    expect(rules.rule1).toEqual(new Aggregation(AggregationType.MAX, 45000));
    expect(rules.rule2).toEqual(new Aggregation(AggregationType.COUNT, 75000));
});

test("info response render with source key", () => {
    const responseRender = renderFactory.getInfoRender();
    const response = [
        "totalSamples",
        10,
        "memoryUsage",
        4209,
        "firstTimestamp",
        date - 10000,
        "lastTimestamp",
        date,
        "retentionTime",
        80000,
        "chunkCount",
        1,
        "chunkSize",
        360,
        "chunkType",
        "compressed",
        "duplicatePolicy",
        "LAST",
        "labels",
        [
            ["label1", 10],
            ["label2", 20]
        ],
        "sourceKey",
        "key",
        "rules",
        [
            ["rule1", 45000, AggregationType.MAX],
            ["rule2", 75000, AggregationType.COUNT]
        ]
    ];
    const rendered: InfoResponse = responseRender.render(response);
    expect(rendered.sourceKey).toBe("key");
    expect(rendered.totalSamples).toBe(10);
    expect(rendered.memoryUsage).toBe(4209);
    expect(rendered.firstTimestamp).toBe(date - 10000);
    expect(rendered.lastTimestamp).toBe(date);
    expect(rendered.retentionTime).toBe(80000);
    expect(rendered.chunkCount).toBe(1);
    expect(rendered.chunkSize).toBe(360);
    expect(rendered.chunkType).toBe("compressed");
    expect(rendered.duplicatePolicy).toBe("LAST");

    const labels = rendered.labels;
    expect(labels.shift()).toEqual(new Label("label1", 10));
    expect(labels.shift()).toEqual(new Label("label2", 20));

    const rules = rendered.rules;
    expect(rules.rule1).toEqual(new Aggregation(AggregationType.MAX, 45000));
    expect(rules.rule2).toEqual(new Aggregation(AggregationType.COUNT, 75000));
});
