interface Grid {
    cables:   Cable[];
    entities: Entity[];
    fuses:    Fuse[];
}

interface Cable {
    fuses:   string[];
    id:      string;
    meters?: Meter[];
}

interface Meter {
    id: string;
    consumption: number;
    name:        string;
    location?: Location;
}

interface Entity {
    id: string,
    fuses:     string[];
    location?: Location;
    name:      string;
    type:      Type;
}

interface Location {
    lat:  number;
    long: number;
}

interface Fuse {
    id:     string;
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
