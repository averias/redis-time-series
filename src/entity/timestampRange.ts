import { CommandKeyword } from "../enum/commandKeyword";
import { StringNumberArray } from "../index";

export class TimestampRange {
    private from: string | number;
    private to: string | number;

    constructor(from?: number, to?: number) {
        this.setFrom(from);
        this.setTo(to);
    }

    public getFrom(): string | number {
        return this.from;
    }

    public setFrom(from?: number): TimestampRange {
        this.from = from == null ? CommandKeyword.MIN_TIMESTAMP : this.validateTimestamp(from);
        return this;
    }

    public getTo(): string | number {
        return this.to;
    }

    public setTo(to?: number): TimestampRange {
        this.to = to == null ? CommandKeyword.MAX_TIMESTAMP : this.validateTimestamp(to);
        return this;
    }

    public flatten(): StringNumberArray {
        return [this.getFrom(), this.getTo()];
    }

    protected validateTimestamp(timestamp: number): number {
        timestamp = Math.trunc(timestamp);
        if (new Date(timestamp).getTime() >= 0) {
            return timestamp;
        }

        throw new Error(`invalid timestamp ${timestamp}`);
    }
}
