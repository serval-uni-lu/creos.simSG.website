const MAX_CONF_LVL = 1;

interface Identifiable {
    readonly id: number | string;
}

interface Localisable {
    latitude: number;
    longitude: number;
}

interface Named {
    name: string;
}

class Grid {
    cables: Map<number, Cable> | Array<Cable>;
    fuses: Map<number, Fuse> | Array<Fuse>;
    meters: Map<number, Meter> | Array<Meter>;
    entities?: Map<number, Entity>;


    constructor(cables: Map<number, Cable> | Array<Cable>, fuses: Map<number, Fuse> | Array<Fuse>,
                meters: Map<number, Meter> | Array<Meter>, entities?: Map<number, Entity>) {
        this.cables = cables;
        this.fuses = fuses;
        this.entities = entities;
        this.meters = meters;
    }

    public getFuse(id: number): Fuse {
        if(this.fuses instanceof Map) {
            return this.fuses.get(id) as Fuse;
        }
        return this.fuses[id];
    }

    public getCable(id: number): Cable {
        if(this.cables instanceof Map) {
            return this.cables.get(id) as Cable;
        }
        return this.cables[id];
    }

    public getMeter(id: number): Meter {
        if(this.meters instanceof Map) {
            return this.meters.get(id) as Meter;
        }
        return this.meters[id];
    }
}

class Cable implements Identifiable, Named {
    fuse1: Fuse;
    fuse2: Fuse;
    meters: Array<Meter>;
    readonly id: number;
    name: string;

    constructor(id: number, fuse1: Fuse, fuse2: Fuse, name?: string) {
        this.fuse1 = fuse1;
        this.fuse1.cable = this;
        this.fuse2 = fuse2;
        this.fuse2.cable = this;
        this.meters = new Array<Meter>();
        this.id = id;
        this.name = (name===undefined)? "Cable " + id : name;
    }

    public get uLoads(): Array<ULoad> {
        return new Array<ULoad>();
    }
}

enum EntityType {
    SUBSTATION = "Substation",
    CABINET = "Cabinet"
}

class Entity implements Identifiable, Localisable, Named {
    fuses: Map<number, Fuse>;
    type: EntityType;
    latitude: number;
    longitude: number;
    name: string;
    readonly id: string;


    constructor(type: EntityType, name: string, latitude?: number, longitude?: number) {
        this.type = type;
        this.id = name;
        this.name = name;
        this.fuses = new Map<number, Fuse>();
        this.latitude = (latitude === undefined)? -1 : latitude;
        this.longitude = (longitude === undefined)? -1 : longitude;
    }
}

class Meter implements Localisable, Named {
    consumption: number;
    latitude: number;
    longitude: number;
    name: string;


    constructor(name: string, consumption?: number, latitude?: number, longitude?: number) {
        this.consumption = (consumption === undefined)? 0 : consumption;
        this.latitude = (latitude === undefined)? -1 : latitude;
        this.longitude = (longitude === undefined)? -1 : longitude;
        this.name = name;
    }
}

class ConfidenceLevel {
    level: number;

    constructor(level: number) {
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
        return 1 - this.level;
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

class UStatus  {
    confidence: ConfidenceLevel;
    state: State;

    constructor(state: State, confidence?: number) {
        const level = (confidence === undefined)? MAX_CONF_LVL : confidence;
        this.confidence = new ConfidenceLevel(level);
        this.state = state;
    }

    public isClosed(): boolean {
        return this.state === State.CLOSED;
    }

    get prettyConf(): string {
        return this.confidence.prettyConf();
    }


    public opposite(): UStatus {
        return new UStatus(oppositeState(this.state), this.confidence.oppositeLevel());
    }

}

class Fuse implements Identifiable, Localisable, Named{
    readonly id: number;
    latitude: number;
    longitude: number;
    name: string;
    status: UStatus;
    uloads: Array<ULoad>;
    private _cable!: Cable;


    constructor(id: number, state: State, confidence?: number, name?: string) {
        this.id = id;
        this.latitude = -1;
        this.longitude = -1;
        this.name = (name === undefined)? "Fuse " + id : name;
        this.status = new UStatus(state, confidence);
        this.uloads = new Array<ULoad>();
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

    public isClosed(): boolean {
        return this.status.isClosed();
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
    UStatus
}

