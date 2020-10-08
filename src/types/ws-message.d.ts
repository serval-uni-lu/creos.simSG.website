type MsgType =
    "ActionList" |
    "LoadApproximation" | "ULoadApproximation" |
    "LoadApproximationAnswer" | "ULoadApproximationAnswer";

interface Message {
    type: MsgType;
}

interface ActionListMsg extends Message {
    actionName: Array<string>;
}

interface LoadApproximationAnswer extends Message {
    fuseLoads: Array<LoadMsg>;
    cableLoads: Array<LoadMsg>;
}

interface ULoadApproximationAnswer extends Message {
    fuseLoads: Array<ULoadMsg>;
    cableLoads: Array<ULoadMsg>;
}

interface LoadMsg {
    id: string,
    value: number
}

interface ULoadMsg {
    id: string;
    uloads: Array<ULoadJson>
}

interface ULoadJson {
    value: number;
    confidence: number;
}

export {Message, ActionListMsg, LoadApproximationAnswer, ULoadApproximationAnswer, LoadMsg, ULoadMsg, ULoadJson}