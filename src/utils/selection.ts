export enum ElmtType {
    NULL,
    Fuse= "Fuse",
    Meter= "Meter",
    Cable= "Cable",
    Entity= "Entity"
}

export class Selection {
    id: string;
    type: ElmtType;
    name: string;


    constructor(id: string, type: ElmtType, name= type + " - " + id) {
        this.id = id;
        this.type = type;
        this.name = name;
    }

    public equals(other: Selection): boolean {
        return this.id === other.id && this.type === other.type;
    }
}

export const NullSelection = new Selection("", ElmtType.NULL);