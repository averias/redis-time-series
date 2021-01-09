import { CommandInterface } from "./interface/command";
import * as Redis from "ioredis";

export class ExpireCommand implements CommandInterface {
    protected readonly receiver: Redis.Redis;
    protected readonly key: string;
    protected readonly seconds: number;

    constructor(receiver: Redis.Redis, key: string, seconds: number) {
        this.key = key;
        this.seconds = seconds;
        this.receiver = receiver;

        if (!Number.isInteger(this.seconds))
            throw new Error(`Only integers allowed for 'seconds' parameter. ${seconds} is not an integer.`);
    }

    public execute(): Promise<Redis.BooleanResponse> {
        return this.receiver.expire(this.key, this.seconds);
    }
}
