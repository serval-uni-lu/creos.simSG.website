import GridState from "@/store/modules/grid-state";
import {CableJson, EntityJson, FuseJson, GridJson, LoadJson, MeterJson} from "@/types/sg-json.types";
import {Cable, ConfidenceLevel, Entity, Fuse, Meter, State, ULoad} from "@/ts/grid";




function _getFuseState(state: GridState, id: string): State {
    const realId = state.fuseIdx.get(id);
    if (realId !== undefined) {
        const status: State | undefined = state.fusesUStatusState[realId].state;
        return (status === undefined) ? State.CLOSED : status;
    }
    return State.CLOSED;
}

function _getFuseConfLevel(state: GridState, id: string): number {
    const realId = state.fuseIdx.get(id);
    if(realId !== undefined) {
        const conf: ConfidenceLevel|undefined = state.fusesUStatusConf[realId].conf;
        return (conf === undefined)? -1 : conf.level;
    } else {
        console.log("Silent error fuseConfLevel()");
        return -1;
    }
}

function _getFuseULoads(state: GridState, id: string): Array<ULoad>|undefined {
    const realId = state.fuseIdx.get(id);
    if(realId !== undefined) {
        return state.fusesULoads[realId].load;
    } else {
        console.log("Silent error get fuseULoads()");
        return [];
    }
}

function _getMeters(state: GridState, id: string): Array<Meter> {
    const resArray = new Array<Meter>();
    (state.grid.cables.get(id) as Cable).meters.forEach((meter: Meter) => resArray.push(meter));
    return resArray;
}

function _getMeterCons(state: GridState, id: string): number {
    const realId = state.meterIdx.get(id);
    if(realId !== undefined) {
        const cons: number|undefined = state.metersCons[realId].cons;
        return (cons === undefined)? 0. : cons;
    }
    console.log("Silent error meterCons");
    return -1;
}



export default function toJson(state: GridState): GridJson {
    const entities: EntityJson[] = new Array<EntityJson>();
    state.grid.entities?.forEach((entity: Entity) => {
        const jsonEnt: EntityJson = {
            id: entity.id,
            name: entity.name,
            type: entity.type,
            fuses: entity.fuses.map((fuse: Fuse) => fuse.id)
        };
        if (entity.latitude !== undefined && entity.longitude !== undefined) {
            jsonEnt.location = {lat: entity.latitude, long: entity.longitude}
        }
        entities.push(jsonEnt);
    });

    const fuses: FuseJson[] = new Array<FuseJson>();
    state.grid.fuses.forEach((fuse: Fuse) => {
        const jsonFuse: FuseJson = {
            id: fuse.id,
            name: fuse.name,
            state: {status: _getFuseState(state, fuse.id), confidence: _getFuseConfLevel(state, fuse.id)},
        };
        const load = _getFuseULoads(state, fuse.id);
        if (load != undefined) {
            jsonFuse.load = new Array<LoadJson>();
            load.forEach((ul: ULoad) => {
                jsonFuse.load?.push({
                    confidence: (typeof ul.confidence === "string")? ul.confidence : ul.confidence.level,
                    value: ul.load
                })
            })
        }
        fuses.push(jsonFuse);
    });

    const cables: CableJson[] = new Array<CableJson>();
    state.grid.cables.forEach((cable: Cable) => {
        const cableJson: CableJson = {
            id: cable.id,
            fuses: [cable.fuse1.id, cable.fuse2.id]
        };

        cableJson.meters = _getMeters(state, cableJson.id).map((meter: Meter) => {
            const json: MeterJson = {
                id: meter.id,
                name: meter.name,
                consumption: _getMeterCons(state, meter.id)
            };

            if (meter.latitude !== -1 && meter.longitude !== -1) {
                json.location = {lat: meter.latitude, long: meter.longitude};
            }

            return json;
        });
        cables.push(cableJson);
    });
    return {entities, fuses, cables};
}