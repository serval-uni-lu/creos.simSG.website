type MsgType = "ActionList" | "LoadApproximation" | "LoadApproximationAnswer";

interface Message {
    type: MsgType;
}

interface ActionListMsg extends Message {
    actionName: Array<string>;
}

interface LoadApproximationAnswer extends Message {
    fuseLoads: Array<Load>;
    cableLoads: Array<Load>
}

interface Load {
    id: string,
    value: number
}

export {Message, ActionListMsg, LoadApproximationAnswer, Load}