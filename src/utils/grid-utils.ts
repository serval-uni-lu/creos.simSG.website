import {CableJson, EntityJson, FuseJson, GridJson, LoadJson, MeterJson} from "@/types/sg-json.types";
import {Cable, ConfidenceLevel, Entity, EntityType, Fuse, Grid, Meter, State, ULoad} from "@/ts/grid";
import {v4 as uuidv4} from 'uuid';


function extractFuses(json: GridJson, mapFuses: Map<string, Fuse>, fuseIdx: Map<string, number>, fusesStates: State[],
                      fusesConf: ConfidenceLevel[], fusesULoads: Array<ULoad>[]) {
    json.fuses.forEach((fuseJson: FuseJson) => {
        const idxArrays = fusesStates.length;
        fuseIdx.set(fuseJson.id, idxArrays);

        const state = (fuseJson.state === undefined ||
            fuseJson.state.status.toLowerCase() === State.CLOSED.toLowerCase()) ? State.CLOSED : State.OPEN;
        fusesStates.push(state);

        const confLvl = (fuseJson.state === undefined)? 1 : fuseJson.state.confidence;
        fusesConf.push(new ConfidenceLevel(confLvl));

        if(fuseJson.load === undefined) {
            fusesULoads.push([]);
        } else {
            const uLoads = new Array<ULoad>();
            fuseJson.load.forEach((value: LoadJson) => {
                uLoads.push(new ULoad(value.value, value.confidence));
            });
            fusesULoads.push(uLoads);
        }

        const fuse = new Fuse(fuseJson.id, fuseJson.name);
        mapFuses.set(fuseJson.id, fuse);
    });
}

function extractCables(json: GridJson, mapFuses: Map<string, Fuse>, mapCables: Map<string, Cable>, cableIdx: Map<string, number>, cableULoad: Array<Array<ULoad>>, meterIdx: Map<string, number>, mapMeter: Map<string, Meter>, meterCons: Array<number>) {
    json.cables.forEach((cableJson: CableJson) => {
        const fuse1 = mapFuses.get(cableJson.fuses[0]) as Fuse;
        const fuse2 = mapFuses.get(cableJson.fuses[1]) as Fuse;

        cableJson.meters?.forEach((meterJson: MeterJson) => {
            const idxMeter = uuidv4();
            const meter = new Meter(idxMeter, meterJson.name, meterJson.location?.lat, meterJson.location?.long);
            meterIdx.set(idxMeter, meterCons.length);
            meterCons.push(meterJson.consumption);
            mapMeter.set(idxMeter, meter);
        });

        cableIdx.set(cableJson.id, cableULoad.length);
        cableULoad.push([]);

        const cable = new Cable(cableJson.id, fuse1, fuse2);
        mapCables.set(cableJson.id, cable);
    });
}

function extractEntities(json: GridJson, mapFuses: Map<string, Fuse>, mapEntities: Map<string, Entity>) {
    json.entities.forEach((entJson: EntityJson) => {
        const type = (entJson.type.toLowerCase() === EntityType.SUBSTATION.toLowerCase())? EntityType.SUBSTATION : EntityType.CABINET;

        const fuses = new Array<Fuse>();
        entJson.fuses.forEach((fuseIdx: string) => {
            const fuse = mapFuses.get(fuseIdx) as Fuse;
            if(entJson.location !== undefined) {
                fuse.latitude = entJson.location.lat;
                fuse.longitude = entJson.location.long;
            }

            fuses.push(fuse);
        });

        const idx = uuidv4();
        const entity = new Entity(idx, type, entJson.name, fuses, entJson.location?.lat, entJson.location?.long);
        mapEntities.set(idx, entity);

    })
}

interface GridData {
    staticInfo: Grid;

    meterIdx: Map<string, number>;
    fuseIdx: Map<string, number>;
    cableIdx: Map<string, number>;

    metersCons: Array<number>;
    fusesStates: Array<State>;
    fusesConf: Array<ConfidenceLevel>;
    fusesULoads: Array<Array<ULoad>>;
    cablesULoads: Array<Array<ULoad>>;
}

function json2Grid(json: GridJson): GridData {
    // fuses
    const fuseIdx = new Map<string, number>();
    const fusesStates = new Array<State>();
    const fusesConf = new Array<ConfidenceLevel>();
    const fusesULoads = new Array<Array<ULoad>>();
    const mapFuses = new Map<string, Fuse>();
    extractFuses(json, mapFuses, fuseIdx, fusesStates, fusesConf, fusesULoads);

    // cables
    const cableIdx = new Map<string, number>();
    const cablesULoads = new Array<Array<ULoad>>();
    const meterIdx = new Map<string, number>();
    const metersCons = new Array<number>();
    const mapCables = new Map<string, Cable>();
    const mapMeter = new Map<string, Meter>();
    extractCables(json, mapFuses, mapCables, cableIdx, cablesULoads, meterIdx, mapMeter, metersCons);

    //entities
    const mapEntities = new Map<string, Entity>();
    extractEntities(json, mapFuses, mapEntities);


    return {
        staticInfo: new Grid(mapCables, mapFuses, mapMeter, mapEntities),

        meterIdx,
        fuseIdx,
        cableIdx,

        metersCons,
        fusesStates,
        fusesConf,
        fusesULoads,
        cablesULoads
    }
}







export {json2Grid, GridData};