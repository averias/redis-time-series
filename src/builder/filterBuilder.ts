import { FilterOperator } from "../enum/filterOperator";
import { Filter } from "../entity/filter";
import { StringNumberArray } from "../index";

/**
 * A Filter object for use in queries
 */
export class FilterBuilder {
    private readonly filters: Filter[];

    /**
     * The label and value in the constructor create a first filter where label=value.
     * More filters can be created by calling the different methods in FilterBuilder
     *
     * @param label the label of the first filter
     * @param value the value represented by the label
     *
     * @remarks
     * ```
     *    // Example
     *    const aggregation = new Aggregation(AggregationType.MAX, 5000);
     *    const timestampRange = new TimestampRange(date, date + 10000);
     *    const filter = new FilterBuilder("label", 1).equal("sensor", 1);
     *    const multiRanges = await redisTimeSeries.multiRange(timestampRange, filter, undefined, aggregation, true);
     * ```
     */
    constructor(label: string, value: string | number) {
        this.filters = [];
        this.equal(label, value);
    }

    public equal(label: string, value: string | number): FilterBuilder {
        this.filters.push(new Filter(label, FilterOperator.EQUAL, value));
        return this;
    }

    public notEqual(label: string, value: string | number): FilterBuilder {
        this.filters.push(new Filter(label, FilterOperator.NOT_EQUAL, value));
        return this;
    }

    public notExists(label: string): FilterBuilder {
        this.filters.push(new Filter(label, FilterOperator.EQUAL));
        return this;
    }

    public exists(label: string): FilterBuilder {
        this.filters.push(new Filter(label, FilterOperator.NOT_EQUAL));
        return this;
    }

    public in(label: string, value: StringNumberArray): FilterBuilder {
        this.filters.push(new Filter(label, FilterOperator.EQUAL, value));
        return this;
    }

    public notIn(label: string, value: StringNumberArray): FilterBuilder {
        this.filters.push(new Filter(label, FilterOperator.NOT_EQUAL, value));
        return this;
    }

    public get(): Filter[] {
        return this.filters;
    }
}
