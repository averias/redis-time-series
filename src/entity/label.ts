import { StringNumberArray } from "../index";

/**
 * A `label`-`value` object
 */
export class Label {
    private readonly name: string;
    private readonly value: string | number;

    /**
     * Creates a new label
     *
     * @param name the name of the label
     * @param value the value represented by the label
     *
     * @remarks
     * ```
     *
     *     // Example
     *
     *     const sensorLabel = new Label('sensor', 1);
     *     sensorLabel.getName() // 'sensor'
     *     sensorLabel.getValue() // 1
     *     sensorLabel.flatten() // [sensor, 1]
     *
     *     const temp = 24, retention=24*3600,
     *      chunkSize=8000, dupPolicy='LAST';
     *     const tempLabel = new Label('temp', temp < 15 ? 'cold': 'warm');
     *     const labels = [sensorLabel, tempLabel]
     *     const rts.create(
     *      'sensor:temp',
     *      labels,
     *      retention,
     *      chunkSize,
     *      dupPolicy
     *     );
     * ```
     */
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
