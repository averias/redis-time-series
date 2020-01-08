import * as Redis from "ioredis";
import { CommandInterface } from "./interface/command";

export class DisconnectCommand implements CommandInterface {
    protected readonly receiver: Redis.Redis;

    constructor(receiver: Redis.Redis) {
        this.receiver = receiver;
    }

    public execute(): Promise<string> {
        return this.receiver.quit();
    }
}
