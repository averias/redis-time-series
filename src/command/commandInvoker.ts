import { CommandInterface } from "./interface/command";

export class CommandInvoker {
    protected command: CommandInterface;

    public setCommand(command: CommandInterface): CommandInvoker {
        this.command = command;
        return this;
    }

    public async run(): Promise<any> {
        return this.command.execute();
    }
}
