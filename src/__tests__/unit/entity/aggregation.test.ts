import { AggregationType } from "../../../enum/aggregationType";
import { CommandKeyword } from "../../../enum/commandKeyword";
import { Aggregation } from "../../../entity/aggregation";

test("create valid aggregation with integer time bucket", () => {
    const aggregation = new Aggregation(AggregationType.AVG, 5000);
    expect(aggregation.getType()).toBe(AggregationType.AVG);
    expect(aggregation.getTimeBucketInMs()).toBe(5000);

    const flattenedAggregation = aggregation.flatten();
    expect(flattenedAggregation).toContain(CommandKeyword.AGGREGATION);
    expect(flattenedAggregation).toContain(AggregationType.AVG);
    expect(flattenedAggregation).toContain(5000);
});

test("create valid aggregation with float time bucket", () => {
    const aggregation = new Aggregation(AggregationType.AVG, 5000.5556);
    expect(aggregation.getTimeBucketInMs()).toBe(5000);

    const flattenedAggregation = aggregation.flatten();
    expect(flattenedAggregation).toContain(5000);
});

test("create aggregation with invalid time bucket", () => {
    expect(() => {
        new Aggregation(AggregationType.AVG, -3500.5625);
    }).toThrow("invalid timestamp '-3500.5625'");
});

test("create aggregation with invalid type", () => {
    expect(() => {
        new Aggregation("invalid", 15000);
    }).toThrow("aggregation type 'invalid' not found");
});
