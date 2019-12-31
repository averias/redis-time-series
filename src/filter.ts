import { FilterOperator } from "./enum";
import { StringNumberArray } from "./request";

class Filter {
    private readonly label: string;
    private readonly operator: string;
    private readonly value?: string | number | StringNumberArray;
    private readonly allowedOperator: string[] = [FilterOperator.EQUAL, FilterOperator.NOT_EQUAL];

    constructor(label: string, operator: string, value?: string | number | StringNumberArray) {
        this.label = label;
        this.operator = this.validateOperator(operator);
        this.value = value;
    }

    public flatten(): string[] {
        let filterString = "";
        if (this.value != null) {
            filterString = this.value instanceof Array ? `(${this.value.join(",")})` : this.value.toString();
        }

        return [`${this.label}${this.operator}${filterString}`];
    }

    protected validateOperator(operator: string): string {
        if (!this.allowedOperator.includes(operator)) {
            throw new Error(`not allowed operator ${operator}`);
        }

        return operator;
    }
}

class FilterBuilder {
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

export { Filter, FilterBuilder };
