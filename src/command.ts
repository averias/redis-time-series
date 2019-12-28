import * as Redis from "ioredis";
import { CommandEnum } from "./enum";
import { StringNumberArray } from "./request";

interface Command {
    execute(): Promise<any>;
}

interface CommandData {
    commandName: string;
    commandFunction: () => any;
    commandParams: StringNumberArray;
}

class CommandProvider {
    protected readonly client: Redis.Redis;
    protected commands: object;

    constructor(redisClient: Redis.Redis) {
        this.client = redisClient;
        this.commands = {};
        this.buildCommands();
    }

    public getCommand(commandName: string): () => any {
        return this.commands[commandName];
    }

    public getCommandData(commandName: string, params: StringNumberArray): CommandData {
        return {
            commandName: commandName,
            commandFunction: this.getCommand(commandName),
            commandParams: params
        };
    }

    public getClient(): Redis.Redis {
        return this.client;
    }

    protected buildCommands(): void {
        for (const key in CommandEnum) {
            const command: string = CommandEnum[key];
            const redisCommand = this.client.createBuiltinCommand(command);
            // @ts-ignore
            this.commands[command] = redisCommand.string;
        }
    }
}

class CommandInvoker {
    protected command: Command;

    public setCommand(command: Command): CommandInvoker {
        this.command = command;
        return this;
    }

    public async run(): Promise<any> {
        return this.command.execute();
    }
}

class CommandReceiver {
    protected readonly client: Redis.Redis;

    constructor(client: Redis.Redis) {
        this.client = client;
    }

    public executeCommand(commandData: CommandData): Promise<any> {
        return new Promise<any>(resolve => {
            const command = commandData.commandFunction;
            resolve(command.call(this.client, ...commandData.commandParams));
        })
            .then(res => {
                return res;
            })
            .catch(err => {
                throw new Error(
                    `error when executing command "${commandData.commandName} ${commandData.commandParams.join(
                        " "
                    )}": ${err.message}`
                );
            });
    }
}

class TimeSeriesCommand implements Command {
    protected readonly receiver: CommandReceiver;
    protected readonly commandData: CommandData;

    constructor(commandData: CommandData, receiver: CommandReceiver) {
        this.commandData = commandData;
        this.receiver = receiver;
    }

    public execute(): Promise<any> {
        return this.receiver.executeCommand(this.commandData);
    }
}

class ResetCommand implements Command {
    protected readonly receiver: Redis.Redis;
    protected readonly keys: string[];

    constructor(receiver: Redis.Redis, keys: string[]) {
        this.keys = keys;
        this.receiver = receiver;
    }

    public execute(): Promise<number> {
        return this.receiver.del(...this.keys);
    }
}

class ResetAllCommand implements Command {
    protected readonly receiver: Redis.Redis;

    constructor(receiver: Redis.Redis) {
        this.receiver = receiver;
    }

    public execute(): Promise<any> {
        return this.receiver.flushdb();
    }
}

export {
    CommandProvider,
    CommandInvoker,
    CommandReceiver,
    TimeSeriesCommand,
    CommandData,
    ResetCommand,
    ResetAllCommand
};
