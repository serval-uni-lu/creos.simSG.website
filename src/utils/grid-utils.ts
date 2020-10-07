import {CableJson, EntityJson, FuseJson, GridJson, LoadJson, MeterJson} from "@/types/sg-json.types";
import {Cable, ConfidenceLevel, Entity, EntityType, Fuse, Grid, Meter, State, ULoad} from "@/ts/grid";

function extractFuses(json: GridJson, mapFuses: Map<string, Fuse>, fuseIdx: Map<string, number>, fusesStates: Array<{state: State; fuseId: string}>,
                      fusesConf: Array<{conf: ConfidenceLevel; fuseId: string}>, fusesULoads: Array<{load: Array<ULoad>; fuseId: string}>) {
    json.fuses.forEach((fuseJson: FuseJson) => {
        const idxArrays = fusesStates.length;
        fuseIdx.set(fuseJson.id, idxArrays);

        const state = (fuseJson.state === undefined ||
            fuseJson.state.status.toLowerCase() === State.CLOSED.toLowerCase()) ? State.CLOSED : State.OPEN;
        fusesStates.push({state: state, fuseId: fuseJson.id});

        const confLvl = (fuseJson.state === undefined)? 1 : fuseJson.state.confidence;
        fusesConf.push({conf: new ConfidenceLevel(confLvl), fuseId: fuseJson.id});

        if(fuseJson.load === undefined) {
            fusesULoads.push({ load: [], fuseId: fuseJson.id});
        } else {
            const uLoads = new Array<ULoad>();
            fuseJson.load.forEach((value: LoadJson) => {
                uLoads.push(new ULoad(value.value, value.confidence));
            });
            fusesULoads.push({load: uLoads, fuseId: fuseJson.id});
        }

        const fuse = new Fuse(fuseJson.id, undefined, fuseJson.name);
        mapFuses.set(fuseJson.id, fuse);
    });
}

function extractCables(json: GridJson, mapFuses: Map<string, Fuse>, mapCables: Map<string, Cable>, cableIdx: Map<string, number>, cableULoad: Array<{load: Array<ULoad>; cableId: string}>, meterIdx: Map<string, number>, mapMeter: Map<string, Meter>, meterCons: Array<{cons: number; meterId: string }>) {
    json.cables.forEach((cableJson: CableJson) => {
        const fuse1 = mapFuses.get(cableJson.fuses[0]) as Fuse;
        const fuse2 = mapFuses.get(cableJson.fuses[1]) as Fuse;

        cableIdx.set(cableJson.id, cableULoad.length);
        cableULoad.push({load: [], cableId: cableJson.id});

        const cable = new Cable(cableJson.id, fuse1, fuse2);
        cable.meters = new Map<string, Meter>();
        mapCables.set(cableJson.id, cable);

        cableJson.meters?.forEach((meterJson: MeterJson) => {
            const meter = new Meter(meterJson.id, meterJson.name, undefined, meterJson.location?.lat, meterJson.location?.long);
            meterIdx.set(meterJson.id, meterCons.length);
            meterCons.push({cons: meterJson.consumption, meterId: meterJson.id});
            mapMeter.set(meterJson.id, meter);
            cable.meters.set(meterJson.id, meter);
        });
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

        const entity = new Entity(entJson.id, type, entJson.name, fuses, entJson.location?.lat, entJson.location?.long);
        mapEntities.set(entJson.id, entity);

    })
}

interface GridData {
    staticInfo: Grid;

    meterIdx: Map<string, number>;
    fuseIdx: Map<string, number>;
    cableIdx: Map<string, number>;

    metersCons: Array<{cons: number; meterId: string }>;
    fusesStates: Array<{state: State; fuseId: string}>;
    fusesConf: Array<{conf: ConfidenceLevel; fuseId: string}>;
    fusesULoads: Array<{load: Array<ULoad>; fuseId: string}>;
    cablesULoads: Array<{load: Array<ULoad>; cableId: string}>;
}

function json2Grid(json: GridJson): GridData {
    // fuses
    const fuseIdx = new Map<string, number>();
    const fusesStates = new Array<{state: State; fuseId: string}>();
    const fusesConf = new Array<{conf: ConfidenceLevel; fuseId: string}>();
    const fusesULoads = new Array<{load: Array<ULoad>; fuseId: string}>();
    const mapFuses = new Map<string, Fuse>();
    extractFuses(json, mapFuses, fuseIdx, fusesStates, fusesConf, fusesULoads);

    // cables
    const cableIdx = new Map<string, number>();
    const cablesULoads = new Array<{load: Array<ULoad>; cableId: string}>();
    const meterIdx = new Map<string, number>();
    const metersCons = new Array<{cons: number; meterId: string }>();
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