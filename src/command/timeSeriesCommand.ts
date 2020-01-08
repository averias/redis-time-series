import { CommandInterface } from "./interface/command";
import { CommandReceiver } from "./commandReceiver";
import { CommandData } from "./interface/commandData";

export class TimeSeriesCommand implements CommandInterface {
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
