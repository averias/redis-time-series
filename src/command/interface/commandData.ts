import { StringNumberArray } from "../../index";

export interface CommandData {
    commandName: string;
    commandFunction: () => any;
    commandParams: StringNumberArray;
}
