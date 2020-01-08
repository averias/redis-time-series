import { CommandInterface } from "./interface/command";
import * as Redis from "ioredis";

export class DeleteAllCommand implements CommandInterface {
    protected readonly receiver: Redis.Redis;

    constructor(receiver: Redis.Redis) {
        this.receiver = receiver;
    }

    public execute(): Promise<any> {
        return this.receiver.flushdb();
    }
}
