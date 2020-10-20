export interface ActionData {
    id: number;
    name: string;
    activated: boolean;
}

export const NULL_ACTION: ActionData = {
    id: -1,
    name: "Choose your actuator",
    activated: true
};

export function actionDataIsNotNull(toTest: ActionData): boolean {
    return toTest.id !== NULL_ACTION.id && toTest.name !== NULL_ACTION.name;
}