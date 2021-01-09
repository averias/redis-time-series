import { FilterOperator } from "../enum/filterOperator";
import { StringNumberArray } from "../index";

/**
 * A `label`-`operator`-`value` object used for filtering queries
 */
export class Filter {
    private readonly label: string;
    private readonly operator: string;
    private readonly value?: string | number | StringNumberArray;
    private readonly allowedOperator: string[] = [FilterOperator.EQUAL, FilterOperator.NOT_EQUAL];

    /**
     * The label and value in the constructor create a filter.
     *
     * @param label the label of the filter
     * @param operator the operator used for the filter i.e. FilterOperator.EQUAL or FilterOperator.NOT_EQUAL
     * @param value the value of the filter
     */
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
