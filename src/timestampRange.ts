import { CommandKeyword } from "./enum";
import { StringNumberArray } from "./request";

export class TimestampRange {
    private from: string | number;
    private to: string | number;

    constructor(from: string | number, to: string | number) {
        this.setFrom(from);
        this.setTo(to);
    }

    public getFrom(): string | number {
        return this.from;
    }

    public setFrom(from: string | number): TimestampRange {
        this.from = this.validateTimestamp(from, CommandKeyword.MIN_TIMESTAMP);
        return this;
    }

    public getTo(): string | number {
        return this.to;
    }

    public setTo(to: string | number): TimestampRange {
        this.to = this.validateTimestamp(to, CommandKeyword.MAX_TIMESTAMP);
        return this;
    }

    public flatten(): StringNumberArray {
        return [this.getFrom(), this.getTo()];
    }

    protected validateTimestamp(timestamp: string | number, defaultTimestamp: string): string | number {
        const valid =
            (typeof timestamp === "number" && new Date(timestamp).getTime() > 0) ||
            (typeof timestamp === "string" && timestamp === defaultTimestamp);

        if (valid) {
            return timestamp;
        }

        throw new Error(`invalid timestamp ${timestamp}`);
    }
}
