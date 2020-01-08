import { FilterOperator } from "../enum/filterOperator";
import { Filter } from "../entity/filter";
import { StringNumberArray } from "../index";

export class FilterBuilder {
    private readonly filters: Filter[];

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
