import {CableJson, EntityJson, FuseJson, GridJson, LoadJson, MeterJson} from "@/types/sg-json.types";
import {Cable, ConfidenceLevel, Entity, EntityType, Fuse, Grid, Meter, State, ULoad} from "@/ts/grid";


function extractFuses(json: GridJson, mapFuses: Map<number, Fuse>, fuseIdx: Map<number, number>, fusesStates: State[],
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

function extractCables(json: GridJson, mapFuses: Map<number, Fuse>, mapCables: Map<number, Cable>, meterIdx: Map<number, number>, mapMeter: Map<number, Meter>, meterCons: Array<number>) {
    let idxMeter = 0;

    json.cables.forEach((cableJson: CableJson) => {
        const fuse1 = mapFuses.get(cableJson.fuses[0]) as Fuse;
        const fuse2 = mapFuses.get(cableJson.fuses[1]) as Fuse;

        cableJson.meters?.forEach((meterJson: MeterJson) => {
            const meter = new Meter(idxMeter, meterJson.name, meterJson.location?.lat, meterJson.location?.long);
            meterIdx.set(idxMeter, meterCons.length);
            idxMeter++;
            meterCons.push(meterJson.consumption);
            mapMeter.set(idxMeter, meter);
        });

        const cable = new Cable(cableJson.id, fuse1, fuse2);
        mapCables.set(cableJson.id, cable);
    });
}

function extractEntities(json: GridJson, mapFuses: Map<number, Fuse>, mapEntities: Map<number, Entity>) {
    json.entities.forEach((entJson: EntityJson, idx: number) => {
        const type = (entJson.type.toLowerCase() === EntityType.SUBSTATION.toLowerCase())? EntityType.SUBSTATION : EntityType.CABINET;

        const fuses = new Array<Fuse>();
        entJson.fuses.forEach((fuseIdx: number) => {
            const fuse = mapFuses.get(fuseIdx) as Fuse;
            if(entJson.location !== undefined) {
                fuse.latitude = entJson.location.lat;
                fuse.longitude = entJson.location.long;
            }

            fuses.push(fuse);
        });

        const entity = new Entity(idx, type, entJson.name, fuses, entJson.location?.lat, entJson.location?.long);
        mapEntities.set(idx, entity);

    })
}

interface GridData {
    staticInfo: Grid;

    meterIdx: Map<number, number>;
    fuseIdx: Map<number, number>;
    cableIdx: Map<number, number>;

    metersCons: Array<number>;
    fusesStates: Array<State>;
    fusesConf: Array<ConfidenceLevel>;
    fusesULoads: Array<Array<ULoad>>;
    cablesULoads: Array<Array<ULoad>>;
}

function json2Grid(json: GridJson): GridData {
    // fuses
    const fuseIdx = new Map<number, number>();
    const fusesStates = new Array<State>();
    const fusesConf = new Array<ConfidenceLevel>();
    const fusesULoads = new Array<Array<ULoad>>();
    const mapFuses = new Map<number, Fuse>();
    extractFuses(json, mapFuses, fuseIdx, fusesStates, fusesConf, fusesULoads);

    // cables
    const cableIdx = new Map<number, number>();
    const cablesULoads = new Array<Array<ULoad>>();
    const meterIdx = new Map<number, number>();
    const metersCons = new Array<number>();
    const mapCables = new Map<number, Cable>();
    const mapMeter = new Map<number, Meter>();
    extractCables(json, mapFuses, mapCables, meterIdx, mapMeter, metersCons);

    //entities
    const mapEntities = new Map<number, Entity>();
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