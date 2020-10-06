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
    cables: Map<string, Cable>;
    fuses: Map<string, Fuse>;
    meters: Map<string, Meter>;
    entities: Map<string, Entity>;


    constructor(cables: Map<string, Cable>, fuses: Map<string, Fuse>, meters: Map<string, Meter>,
                entities: Map<string, Entity>) {
        this.cables = cables;
        this.fuses = fuses;
        this.entities = entities;
        this.meters = meters;
    }
}

class Cable implements Named {
    fuse1: Fuse;
    fuse2: Fuse;
    meters: Map<string, Meter>;
    readonly id: string;
    name: string;

    constructor(id: string, fuse1: Fuse, fuse2: Fuse, name: string = "Cable " + id) {
        this.fuse1 = fuse1;
        this.fuse1.cable = this;
        this.fuse2 = fuse2;
        this.fuse2.cable = this;
        this.meters = new Map<string, Meter>();
        this.id = id;
        this.name = name;
    }

    public addMeter(meter: Meter) {
        this.meters.set(meter.id, meter);
    }

    public delMeter(meterId: string) {
        const meter = this.meters.get(meterId) as Meter;
        this.meters.delete(meterId);
        meter.cable = undefined;
    }
}

enum EntityType {
    SUBSTATION = "Substation",
    CABINET = "Cabinet"
}

class Entity implements Localisable, Named {
    private _fuses: Map<string, Fuse>;
    type: EntityType;
    latitude?: number;
    longitude?: number;
    name: string;
    readonly id: string;


    constructor(id: string, type: EntityType, name: string, fuses: Array<Fuse>, latitude?: number, longitude?: number,) {
        this.type = type;
        this.id = id;
        this.name = name;
        this._fuses = new Map<string, Fuse>();
        fuses.forEach((fuse: Fuse) => this._fuses.set(fuse.id, fuse));
        this.latitude = latitude;
        this.longitude = longitude;
    }

    get fuses(): Array<Fuse> {
        const res = new Array<Fuse>();
        this._fuses.forEach((fuse: Fuse) => res.push(fuse));
        return res;
    }

    public addFuse(fuse: Fuse) {
        this._fuses.set(fuse.id, fuse);
    }

    public deleteFuse(fuseId: string) {
        this._fuses.delete(fuseId);
    }

    public deleteAllFuses() {
        this._fuses.clear();
    }
}

class Meter implements Localisable, Named {
    latitude: number;
    longitude: number;
    name: string;
    readonly id: string;
    cable?: Cable;

    constructor(id: string, name: string = "Meter " + id, cable: Cable|undefined= undefined, latitude = -1, longitude = -1) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.name = name;
        this.id = id;
        this.cable = cable;
        this.cable?.addMeter(this);
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

class Fuse implements Localisable, Named{
    readonly id: string;
    latitude?: number;
    longitude?: number;
    name: string;
    private _cable!: Cable;
    owner?: Entity;


    constructor(id: string, owner?: Entity, name: string = "Fuse " + id) {
        this.id = id;
        this.name = name;
        this.owner = owner;
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

