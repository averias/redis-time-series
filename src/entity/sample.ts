import { CommandKeyword } from "../enum/commandKeyword";
import { StringNumberArray } from "../index";

/**
 * A `key`-`value`-`timestamp` object
 */
export class Sample {
    private key: string;
    private value: number;
    private timestamp: string | number;

    /**
     * Creates a Sample object
     *
     * @param key Key name for timeseries
     * @param value The value of the sample
     * @param timestamp The timestamp of the sample in ms
     * @returns the created Sample object
     *
     * @remarks
     * ```
     *     // Example
     *     const tsSample = new Sample('temperature:2:32', 25, 1609682633000);
     *
     *     tsSample.getKey(); // 'temperature:2:32'
     *     tsSample.setKey('temperature:5:15'); // Sample('temperature:5:15', 25, 1609682633000)
     *     tsSample.getValue(); // 25
     *     tsSample.setValue(27); // Sample('temperature:5:15', 27, 1609682633000)
     *     tsSample.getTimestamp(); // 1609682633000
     *     tsSample.setTimestamp(1609682634000); // Sample('temperature:5:15', 27, 1609682634000)
     *     tsSample.flatten(); // ['temperature:5:15', 1609682634000, 27]
     * ```
     */
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
