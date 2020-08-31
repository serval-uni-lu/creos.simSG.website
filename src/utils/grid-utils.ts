import {CableJson, EntityJson, FuseJson, GridJson, LoadJson, MeterJson} from "@/types/sg-json.types";
import {getScNbFuses, Scenario} from "@/ts/scenario";
import {Cable, Entity, EntityType, Fuse, Grid, Meter, State, ULoad} from "@/ts/grid";


function extractFuses(json: GridJson, mapFuses: Map<number, Fuse>) {
    json.fuses.forEach((fuseJson: FuseJson) => {
        const state = (fuseJson.state === undefined ||
            fuseJson.state.status === undefined ||
            fuseJson.state.status.toLowerCase() === State.CLOSED.toLowerCase()) ? State.CLOSED : State.OPEN;

        const fuse = new Fuse(fuseJson.id, state, fuseJson.state?.confidence, fuseJson.name);
        fuseJson.load?.forEach((load: LoadJson) => {
            fuse.uloads.push(new ULoad(load.value, load.confidence));
        });

        mapFuses.set(fuseJson.id, fuse);

    });
}

function extractCables(json: GridJson, mapFuses: Map<number, Fuse>, mapCables: Map<number, Cable>, mapMeter: Map<number, Meter>) {
    let idxMeter = 0;


    json.cables.forEach((cableJson: CableJson) => {
        const fuse1 = mapFuses.get(cableJson.fuses[0]) as Fuse;
        const fuse2 = mapFuses.get(cableJson.fuses[1]) as Fuse;

        const cable = new Cable(cableJson.id, fuse1, fuse2);
        mapCables.set(cableJson.id, cable);

        cableJson.meters?.forEach((meterJson: MeterJson) => {
           const meter = new Meter(meterJson.name, meterJson.consumption);
           mapMeter.set(idxMeter, meter);
           idxMeter++;
           cable.meters.push(meter);
        });


    });
}

function extractEntities(json: GridJson, mapFuses: Map<number, Fuse>, mapEntities: Map<number, Entity>) {
    json.entities.forEach((entJson: EntityJson, idx: number) => {
        const type = (entJson.type.toLowerCase() === EntityType.SUBSTATION.toLowerCase())? EntityType.SUBSTATION : EntityType.CABINET;

        const ent = new Entity(type, entJson.name, entJson.location?.lat, entJson.location?.long);
        entJson.fuses.forEach((fuseId: number) => {
            const fuse = mapFuses.get(fuseId) as Fuse;
            ent.fuses.set(fuseId, fuse);
            if(entJson.location !== undefined) {
                fuse.latitude = entJson.location.lat;
                fuse.longitude = entJson.location.long;
            }
        });
        mapEntities.set(idx, ent);
    });
}

function json2Grid(json: GridJson): Grid {
    // fuses
    const mapFuses = new Map<number, Fuse>();
    extractFuses(json, mapFuses);

    // cables
    const mapCables = new Map<number, Cable>();
    const mapMeter = new Map<number, Meter>();
    extractCables(json, mapFuses, mapCables, mapMeter);

    //entities
    const mapEntities = new Map<number, Entity>();
    extractEntities(json, mapFuses, mapEntities);


    return new Grid(mapCables, mapFuses, mapMeter, mapEntities);
}



function scenario2Grid(scenario: Scenario): Grid {
    const nbFuses = getScNbFuses(scenario);

    const fuses = new Array<Fuse>();
    const cables = new Array<Cable>();
    const meters = new Array<Meter>();

    for (let i=0; i<nbFuses; i++) {
        fuses.push(new Fuse(i, State.CLOSED));
    }

    for (let i = 0; i < (nbFuses / 2); i++) {
        const fuse1 = fuses[i*2];
        const fuse2 = fuses[i*2 + 1];
        const cable= new Cable(i, fuse1, fuse2);
        cables.push(cable);

        const meter = new Meter("Meter " + i);
        meters.push(meter);
        cable.meters.push(meter);

    }

    return new Grid(cables, fuses, meters)
}




export {json2Grid, scenario2Grid};