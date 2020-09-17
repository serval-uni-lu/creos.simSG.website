const MAX_CONF_LVL = 1;

interface Identifiable {
    readonly id: number;
}

interface Localisable {
    latitude?: number;
    longitude?: number;
}

interface Named {
    name: string;
}

class Grid {
    cables: Map<number|string, Cable>;
    fuses: Map<number, Fuse>;
    meters: Map<number, Meter>;
    entities?: Map<number, Entity>;


    constructor(cables: Map<number, Cable>, fuses: Map<number, Fuse>, meters: Map<number, Meter>,
                entities?: Map<number, Entity>) {
        this.cables = cables;
        this.fuses = fuses;
        this.entities = entities;
        this.meters = meters;
    }
}

class Cable implements Identifiable, Named {
    fuse1: Fuse;
    fuse2: Fuse;
    meters: Array<Meter>;
    readonly id: number;
    name: string;

    constructor(id: number, fuse1: Fuse, fuse2: Fuse, name: string = "Cable " + id) {
        this.fuse1 = fuse1;
        this.fuse1.cable = this;
        this.fuse2 = fuse2;
        this.fuse2.cable = this;
        this.meters = new Array<Meter>();
        this.id = id;
        this.name = name;
    }
}

enum EntityType {
    SUBSTATION = "Substation",
    CABINET = "Cabinet"
}

class Entity implements Identifiable, Localisable, Named {
    fuses: Array<Fuse>;
    type: EntityType;
    latitude?: number;
    longitude?: number;
    name: string;
    readonly id: number;


    constructor(id: number, type: EntityType, name: string, fuses: Array<Fuse>, latitude?: number, longitude?: number,) {
        this.type = type;
        this.id = id;
        this.name = name;
        this.fuses = fuses;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}

class Meter implements Identifiable, Localisable, Named {
    latitude: number;
    longitude: number;
    name: string;
    readonly id: number;

    constructor(id: number, name: string = "Meter " + id, latitude = -1, longitude = -1) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.name = name;
        this.id = id;
    }

}

class ConfidenceLevel {
    level: number;

    constructor(level: number = MAX_CONF_LVL) {
        if(!this.isValidLevel(level)) {
            throw new RangeError("Level should be between 0 and 1 (included)");
        }
        this.level = level;
    }

    public isValidLevel(toCheck: number): boolean {
        return toCheck >= 0 && toCheck <= 1;
    }

    public prettyConf(): string {
        return (this.level * 100).toFixed(2);
    }

    public oppositeLevel(): number {
        return MAX_CONF_LVL - this.level;
    }
}

class ULoad {
    load: number;
    confidence: ConfidenceLevel;

    constructor(load: number, confidence?: number) {
        this.load = load;
        const level = (confidence===undefined)? MAX_CONF_LVL : confidence;
        this.confidence = new ConfidenceLevel(level);
    }

    public prettyLoad(): string {
        return this.load.toFixed(2);
    }

    public prettyConf(): string {
        return this.confidence.prettyConf();
    }

}

enum State {
    CLOSED = "Closed",
    OPEN = "Open"
}

function oppositeState(current: State): State {
    if(current === State.CLOSED) {
        return State.OPEN;
    }
    return State.CLOSED;
}


// class UStatus  {
//     confidence: ConfidenceLevel;
//     state: State;
//
//     constructor(state: State, confidence?: number) {
//         const level = (confidence === undefined)? MAX_CONF_LVL : confidence;
//         this.confidence = new ConfidenceLevel(level);
//         this.state = state;
//     }
//
//     public isClosed(): boolean {
//         return this.state === State.CLOSED;
//     }
//
//     get prettyConf(): string {
//         return this.confidence.prettyConf();
//     }
//
//
//     public opposite(): UStatus {
//         return new UStatus(oppositeState(this.state), this.confidence.oppositeLevel());
//     }
//
// }

class Fuse implements Identifiable, Localisable, Named{
    readonly id: number;
    latitude?: number;
    longitude?: number;
    name: string;
    private _cable!: Cable;


    constructor(id: number, name: string = "Fuse " + id) {
        this.id = id;
        this.name = name;
    }

    public get cable(): Cable {
        return this._cable;
    }

    public set cable(cable: Cable) {
        if(cable === undefined) {
            throw new TypeError("cable cannot be undefined");
        }
        this._cable = cable;
    }

}


export {
    Grid,
    Meter,
    Cable,
    Fuse,
    Entity,
    EntityType,
    State,
    ULoad,
    ConfidenceLevel,
    oppositeState
}

