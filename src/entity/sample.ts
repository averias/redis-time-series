import { CommandKeyword } from "../enum/commandKeyword";
import { StringNumberArray } from "../index";

export class Sample {
    private key: string;
    private value: number;
    private timestamp: string | number;

    constructor(key: string, value: number, timestamp?: number) {
        this.setKey(key);
        this.setValue(value);
        this.setTimestamp(timestamp);
    }

    public getKey(): string {
        return this.key;
    }

    public setKey(key: string): Sample {
        this.key = key;
        return this;
    }

    public getValue(): number {
        return this.value;
    }

    public setValue(value: number): Sample {
        this.value = value;
        return this;
    }

    public getTimestamp(): string | number {
        return this.timestamp;
    }

    public setTimestamp(timestamp?: number): Sample {
        this.timestamp = this.validateTimestamp(timestamp);
        return this;
    }

    public flatten(): StringNumberArray {
        return [this.getKey(), this.getTimestamp(), this.getValue()];
    }

    protected validateTimestamp(timestamp?: number): string | number {
        if (timestamp == null) {
            return CommandKeyword.CURRENT_TIMESTAMP;
        }

        timestamp = Math.trunc(timestamp);

        if (this.isValidTimestamp(timestamp)) {
            return timestamp;
        }

        throw new Error(`wrong timestamp: ${timestamp}`);
    }

    protected isValidTimestamp(timestamp: number): boolean {
        return new Date(timestamp).getTime() >= 0;
    }
}
