import {Message, ActionListMsg} from "@/types/ws-message";
import Vue from 'vue'
import {ActionData} from "@/utils/actionUtils";

const WS_URL = 'ws://localhost:8585/ws';
let ws: WebSocket | undefined;

function onclose() {
    console.debug("Connection closed.");
}

function onopen() {
    console.debug("Server connected.");
}

function onmessage(event: MessageEvent) {
    console.debug("Message received.");

    let message = JSON.parse(event.data) as Message
    if(message.type === "ActionList") {
        message = message as ActionListMsg;

        const setActions = new Set<string>();
        (message as ActionListMsg).actionName.forEach((name: string) => setActions.add(name));
        Vue.prototype.$actionCmp.forEach((action: ActionData, idx: number) => {
            if(setActions.has(action.name)) {
                Vue.set(Vue.prototype.$actionCmp, idx, {...action, activated: true})
            }
        });
    }

}

export function connect() {
    console.debug("Connection attempt to " + WS_URL);
    if(ws !== undefined) {
        ws.close(4000, "Server not connected");
        ws = undefined;
    }

    ws = new WebSocket(WS_URL);
    ws.onopen = onopen;
    ws.onclose = onclose;
    ws.onmessage = onmessage;
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
