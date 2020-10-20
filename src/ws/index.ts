import {Message, ActionListMsg, LoadApproximationAnswer, ULoadApproximationAnswer} from "@/types/ws-message";
import Vue from 'vue'
import {ActionData} from "@/utils/actionUtils";

const WS_URL = 'ws://localhost:8585/ws';
let ws: WebSocket | undefined;
let application: Vue | undefined;

function onclose() {
    console.debug("Connection closed.");
}

function onopen() {
    console.debug("Server connected.");
}

function onmessage(event: MessageEvent) {
    console.debug("Message received: " + event.data);

    const message = JSON.parse(event.data) as Message
    // ActionList is the first message sent by the server
    // It contains the list of action the server implements
    // The elements of this list should correspond to one action name
    if(message.type === "ActionList") {
        const setActions = new Set<string>();
        (message as ActionListMsg).actionName.forEach((name: string) => setActions.add(name));
        Vue.prototype.$actionCmp.forEach((action: ActionData, idx: number) => {
            if(setActions.has(action.name) && application != undefined) {
                Vue.set(application.$actionCmp, idx, {...action, activated: true});
            }
        });
    } else if(message.type === "LoadApproximationAnswer") {
        application?.$store.commit("GridState/setFusesLoad", (message as LoadApproximationAnswer).fuseLoads);
        application?.$store.commit("GridState/setCablesLoad", (message as LoadApproximationAnswer).cableLoads);
    } else if (message.type == "ULoadApproximationAnswer") {
        application?.$store.commit("GridState/setFusesULoad", (message as ULoadApproximationAnswer).fuseLoads);
        application?.$store.commit("GridState/setCablesULoad", (message as ULoadApproximationAnswer).cableLoads);
    } else {
        console.error("Message type not supported: " + message.type);
    }

}

export function connect(app: Vue) {
    console.debug("Connection attempt to " + WS_URL);
    if(ws !== undefined) {
        ws.close(4000, "Server not connected");
        ws = undefined;
    }

    ws = new WebSocket(WS_URL);
    ws.onopen = onopen;
    ws.onclose = onclose;
    ws.onmessage = onmessage;

    application = app;
}

export function sendMessage(message: Message) {
    if(ws !== undefined) {
        const msgStr = JSON.stringify(message);
        ws.send(msgStr);
        console.debug("Message sent: " + msgStr);
    } else {
        console.debug("Message not sent: websocket is not open.")
    }
}
