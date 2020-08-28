export interface GridJson {
    cables:   Cable[];
    entities: Entity[];
    fuses:    Fuse[];
}

export interface Cable {
    fuses:   number[];
    id:      number;
    meters?: Meter[];
}

export interface Meter {
    consumption: number;
    name:        string;
}

export interface Entity {
    fuses:     number[];
    location?: Location;
    name:      string;
    type:      Type;
}

export interface Location {
    lat:  number;
    long: number;
}

export enum Type {
    Cabinet = "cabinet",
    Substation = "substation",
    TypeCABINET = "CABINET",
    TypeCabinet = "Cabinet",
    TypeSUBSTATION = "SUBSTATION",
    TypeSubstation = "Substation",
}

export interface Fuse {
    id:     number;
    load?:  Load[];
    name:   string;
    state?: State;
}

export interface Load {
    confidence: number;
    value:      number;
}

export interface State {
    confidence: number;
    status:     Status;
}

export enum Status {
    Closed = "CLOSED",
    Open = "OPEN",
    PurpleClosed = "closed",
    PurpleOpen = "Open",
    StatusClosed = "Closed",
    StatusOpen = "open",
}
