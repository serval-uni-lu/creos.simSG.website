type MsgType = "ActionList" | "LoadApproximation";

interface Message {
    type: MsgType;
}

interface ActionListMsg extends Message {
    actionName: Array<string>;
}

export {Message, ActionListMsg}