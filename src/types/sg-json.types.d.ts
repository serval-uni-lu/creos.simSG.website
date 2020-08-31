interface Grid {
    cables:   Cable[];
    entities: Entity[];
    fuses:    Fuse[];
}

interface Cable {
    fuses:   number[];
    id:      number;
    meters?: Meter[];
}

interface Meter {
    consumption: number;
    name:        string;
}

interface Entity {
    fuses:     number[];
    location?: Location;
    name:      string;
    type:      Type;
}

interface Location {
    lat:  number;
    long: number;
}

interface Fuse {
    id:     number;
    load?:  Load[];
    name:   string;
    state?: State;
}

interface Load {
    confidence: number;
    value:      number;
}

interface State {
    confidence: number;
    status:     Status;
}


type Type = "cabinet" | "substation" | "CABINET" | "Cabinet" | "SUBSTATION" | "Substation";
type Status = "CLOSED" | "OPEN" | "closed" | "Open" | "Closed" | "open";

export {
    Grid as GridJson,
    Cable as CableJson,
    Meter as MeterJson,
    Entity as EntityJson,
    Location as LocationJson,
    Fuse as FuseJson,
    Load as LoadJson,
    State as StateJson
}
