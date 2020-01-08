import { StringNumberArray } from "../index";

export class Label {
    private readonly name: string;
    private readonly value: string | number;

    constructor(name: string, value: string | number) {
        this.name = name;
        this.value = value;
    }

    public getName(): string {
        return this.name;
    }

    public getValue(): string | number {
        return this.value;
    }

    public flatten(): StringNumberArray {
        return [this.getName(), this.getValue()];
    }
}
