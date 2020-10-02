import {Module, Mutation, VuexModule} from "vuex-module-decorators";
import {getScNbFuses, Scenario} from "@/ts/scenario";
import {Cable, ConfidenceLevel, Entity, EntityType, Fuse, Grid, Meter, oppositeState, State, ULoad} from "@/ts/grid";
import {Vue} from "vue-property-decorator";
import {CableJson, EntityJson, FuseJson, GridJson, LoadJson, MeterJson} from "@/types/sg-json.types";
import {GridData, json2Grid} from "@/utils/grid-utils";
import {v4 as uuidv4} from 'uuid';

export interface UpdateNumVal {
    id: string;
    newValue: number;
}

export interface DataNewEntity {
    id: string;
    type: EntityType;
}

export interface DataNewCable {
    id: string;
    entityId1: string;
    entityId2: string;
}

export interface DataConnCblMeter {
    meterId: string;
    cableId: string;
}


const NULL_GRID: Grid = new Grid(
    new Map<string, Cable>(),
    new Map<string, Fuse>(),
    new Map<string, Meter>()
);


function _getFuseState(state: GridState, id: string): State {
    const realId = state.fuseIdx.get(id);
    if (realId !== undefined) {
        const status: State | undefined = state.fusesUStatusState[realId].state;
        return (status === undefined) ? State.CLOSED : status;
    }
    return State.CLOSED;
}

function _deleteCable(state: GridState, cableId: string) {
    const cable = state.grid.cables.get(cableId);
    if(cable !== undefined) {
        cable.meters.forEach((meter: Meter) => state.deleteMeter(meter.id));
        cable.fuse1.owner?.deleteFuse(cable.fuse1.id);
        cable.fuse2.owner?.deleteFuse(cable.fuse2.id);

        state.grid.fuses.delete(cable.fuse1.id);
        state.grid.fuses.delete(cable.fuse2.id);
    }

    const id = state.cableIdx.get(cableId) as number;
    for(let i=id; i<state.cablesULoads.length - 1; i++) {
        state.cablesULoads[i] = state.cablesULoads[i + 1];
        state.cableIdx.set(state.cablesULoads[i].cableId, i);
    }
    state.cableIdx.delete(cableId);
    state.grid.cables.delete(cableId);
}

@Module({
    namespaced: true
})
export default class GridState extends VuexModule {
    public grid: Grid = NULL_GRID;

    public meterIdx = new Map<string, number>();
    public fuseIdx = new Map<string, number>();
    public cableIdx = new Map<string, number>();

    public metersCons = new Array<{cons: number; meterId: string }>();
    public fusesUStatusState = new Array<{state: State; fuseId: string}>();
    public fusesUStatusConf = new Array<{conf: ConfidenceLevel; fuseId: string}>();
    public fusesULoads = new Array<{load: Array<ULoad>; fuseId: string}>();
    public cablesULoads = new Array<{load: Array<ULoad>; cableId: string}>();

    get fuseState() {
        return (id: string): State => {
            return _getFuseState(this, id);
        }
    }

    get fuseIsClosed() {
        return (id: string): boolean => {
            return _getFuseState(this, id) === State.CLOSED;
        }
    }

    get fuseULoads() {
        return (id: string): Array<ULoad>|undefined => {
            const realId = this.fuseIdx.get(id);
            if(realId !== undefined) {
                return this.fusesULoads[realId].load;
            } else {
                console.log("Silent error get fuseULoads()");
                return [];
            }
        }
    }

    get cableULoads() {
        return (id: string): Array<ULoad> => {
            const realId = this.cableIdx.get(id);
            if(realId !== undefined) {
                return this.cablesULoads[realId].load;
            } else {
                console.log("Silent error get cableULoads()");
                return [];
            }
        }
    }

    get fuseConfLevel() {
        return (id: string): number => {
            const realId = this.fuseIdx.get(id);
            if(realId !== undefined) {
                const conf: ConfidenceLevel|undefined = this.fusesUStatusConf[realId].conf;
                return (conf === undefined)? -1 : conf.level;
            } else {
                console.log("Silent error fuseConfLevel()");
                return -1;
            }
        }
    }

    get fuseConfLevelStr() {
        return (id: string): string => {
            const realId = this.fuseIdx.get(id);
            if(realId !== undefined) {
                const conf: ConfidenceLevel|undefined = this.fusesUStatusConf[realId].conf;
                return (conf === undefined)? "-1" : conf.prettyConf();
            } else {
                console.log("Silent error fuseCOnfLevel()");
                return "-1";
            }
        }
    }

    get meterCons() {
        return (id: string): number => {
            const realId = this.meterIdx.get(id);
            if(realId !== undefined) {
                const cons: number|undefined = this.metersCons[realId].cons;
                return (cons === undefined)? 0. : cons;
            }
            console.log("Silent error meterCons");
            return -1;
        }
    }

    get meterName() {
        return (id: string): string => {
            return (this.grid.meters.get(id) as Meter).name;
        }
    }

    get meters() {
        return (cableId: string): Array<Meter> => {
            const resArray = new Array<Meter>();
            (this.grid.cables.get(cableId) as Cable).meters.forEach((meter: Meter) => resArray.push(meter));
            return resArray;
        }
    }

    get gridJson() {
        const entities: EntityJson[] = new Array<EntityJson>();
        this.grid.entities?.forEach((entity: Entity) => {
            const jsonEnt: EntityJson = {
                name: entity.name,
                type: entity.type,
                fuses: entity.fuses.map((fuse: Fuse) => fuse.id)
            };
            if(entity.latitude !== undefined && entity.longitude !== undefined) {
                jsonEnt.location = {lat: entity.latitude, long: entity.longitude}
            }
            entities.push(jsonEnt);
        });

        const fuses: FuseJson[] = new Array<FuseJson>();
        this.grid.fuses.forEach((fuse: Fuse) => {
            const jsonFuse: FuseJson = {
                id: fuse.id,
                name: fuse.name,
                state: {status: this.fuseState(fuse.id), confidence: this.fuseConfLevel(fuse.id)},
            };
            const load = this.fuseULoads(fuse.id);
            if(load != undefined) {
                jsonFuse.load = new Array<LoadJson>();
                load.forEach((ul: ULoad) => {
                    jsonFuse.load?.push({
                        confidence: ul.confidence.level,
                        value: ul.load
                    })
                })
            }
            fuses.push(jsonFuse);
        });

        const cables: CableJson[] = new Array<CableJson>();
        this.grid.cables.forEach((cable: Cable) => {
            const cableJson: CableJson = {
                id: cable.id,
                fuses: [cable.fuse1.id, cable.fuse2.id]
            };

            cableJson.meters = this.meters(cableJson.id).map((meter: Meter) => {
                const json: MeterJson = {
                    name: meter.name,
                    consumption: this.meterCons(meter.id)
                };

                if(meter.latitude !== -1 && meter.longitude !== -1) {
                    json.location = {lat: meter.latitude, long: meter.longitude};
                }

                return json;
            });
            cables.push(cableJson);
        });

        return JSON.stringify({entities, fuses, cables}, undefined, 2)
    }

    @Mutation
    public initEmpty() {
        this.grid = NULL_GRID;

        this.meterIdx = new Map<string, number>();
        this.fuseIdx = new Map<string, number>();
        this.cableIdx = new Map<string, number>();

        this.metersCons = new Array<{cons: number; meterId: string }>();
        this.fusesUStatusState = new Array<{state: State; fuseId: string}>();
        this.fusesUStatusConf = new Array<{conf: ConfidenceLevel; fuseId: string}>();
        this.fusesULoads = new Array<{load: Array<ULoad>; fuseId: string}>();
        this.cablesULoads = new Array<{load: Array<ULoad>; cableId: string}>();
    }

    @Mutation
    public addEntity(data: DataNewEntity) {
        if(this.grid.entities === undefined) {
            this.grid.entities = new Map<string, Entity>();
        }
        this.grid.entities.set(data.id, new Entity(data.id, data.type, data.type + " " + data.id, new Array<Fuse>()));
    }

    @Mutation
    public addCable(data: DataNewCable) {
        let fuseId = uuidv4();
        const fuse1 = new Fuse(fuseId, this.grid.entities?.get(data.entityId1) as Entity);
        this.grid.fuses.set(fuseId, fuse1);
        this.fuseIdx.set(fuseId, this.fusesUStatusConf.length);
        this.fusesUStatusConf.push({conf: new ConfidenceLevel(), fuseId});
        this.fusesUStatusState.push({state: State.CLOSED, fuseId});
        this.fusesULoads.push({load: [], fuseId});


        fuseId = uuidv4();
        const fuse2 = new Fuse(fuseId, this.grid.entities?.get(data.entityId2) as Entity);
        this.grid.fuses.set(fuseId, fuse2);
        this.fuseIdx.set(fuseId, this.fusesUStatusConf.length);
        this.fusesUStatusConf.push({conf: new ConfidenceLevel(), fuseId});
        this.fusesUStatusState.push({state: State.CLOSED, fuseId});
        this.fusesULoads.push({load: [], fuseId});


        this.grid.cables.set(data.id, new Cable(data.id, fuse1, fuse2, "Cable"));
        this.cableIdx.set(data.id, this.cablesULoads.length);
        this.cablesULoads.push({load: [], cableId: data.id});

        const entity1 = this.grid.entities?.get(data.entityId1) as Entity;
        const entity2 = this.grid.entities?.get(data.entityId2) as Entity;

        entity1.addFuse(fuse1);
        entity2.addFuse(fuse2);
    }

    @Mutation
    public addMeter(id: string) {
        const meter = new Meter(id);
        this.grid.meters.set(id, meter);
        this.meterIdx.set(id, this.metersCons.length);
        this.metersCons.push({cons: 0., meterId: id});
    }

    @Mutation
    public connectMeter2Cable(data: DataConnCblMeter) {
        const cable = this.grid.cables.get(data.cableId) as Cable;
        const meter = this.grid.meters.get(data.meterId) as Meter;
        cable.meters.set(data.meterId, meter);
    }

    @Mutation
    public initFromScenario(scenario: Scenario) {
        this.metersCons = new Array<{cons: number; meterId: string }>();
        this.fusesUStatusState = new Array<{state: State; fuseId: string}>();
        this.fusesUStatusConf = new Array<{conf: ConfidenceLevel; fuseId: string}>();
        this.fusesULoads = new Array<{load: Array<ULoad>; fuseId: string}>();
        this.cablesULoads = new Array<{load: Array<ULoad>; cableId: string}>();

        const nbFuses = getScNbFuses(scenario);

        const fuses = new Map<string, Fuse>();
        const cables = new Map<string, Cable>();
        const meters = new Map<string, Meter>();

        for (let i=0; i<nbFuses; i++) {
            const id = i + "";
            fuses.set(id, new Fuse(id));
            this.fuseIdx.set(id, this.fusesUStatusState.length);
            this.fusesUStatusState.push({state: State.CLOSED, fuseId: id});
            this.fusesUStatusConf.push({conf: new ConfidenceLevel(), fuseId: id});
            this.fusesULoads.push({load: [], fuseId: id});
        }

        const itFuses = fuses.entries();
        let fuse1 = itFuses.next();
        let fuse2 = itFuses.next();
        let cableIdx = 0;
        while (!fuse1.done) {
            const id = cableIdx + "";
            const cable = new Cable(uuidv4(), fuse1.value[1], fuse2.value[1]);
            cables.set(id, cable);
            this.cableIdx.set(id, this.cablesULoads.length);
            this.cablesULoads.push({load: [], cableId: id});

            const meterId = id;
            const meter = new Meter(meterId);
            meters.set(meterId, meter);
            cable.meters.set(meterId, meter);
            this.meterIdx.set(meterId, this.metersCons.length);

            this.metersCons.push({cons: 0., meterId});

            fuse1 = itFuses.next();
            fuse2 = itFuses.next();
            cableIdx++;
        }

        this.grid = new Grid(cables, fuses, meters);
    }

    @Mutation
    public initFromJson(json: GridJson) {
        const data: GridData = json2Grid(json);

        this.grid = data.staticInfo;

        this.meterIdx = data.meterIdx;
        this.fuseIdx = data.fuseIdx;
        this.cableIdx = data.cableIdx;

        this.metersCons = data.metersCons;
        this.fusesUStatusState = data.fusesStates;
        this.fusesUStatusConf = data.fusesConf;
        this.fusesULoads = data.fusesULoads;
        this.cablesULoads = data.cablesULoads;
    }

    @Mutation
    public updateConsumption(data: UpdateNumVal) {
        const id = this.meterIdx.get(data.id);
        if(id !== undefined) {
            Vue.set(this.metersCons, id, {cons: data.newValue, meterId: data.id});
        } else {
            console.log("Silent error in updateConsumption");
        }
    }

    @Mutation
    public updateStateConf(data: UpdateNumVal) {
        const id = this.fuseIdx.get(data.id);
        console.log("ici")
        if(id !== undefined) {
            Vue.set(this.fusesUStatusConf, id, {conf: new ConfidenceLevel(data.newValue), fuseId: data.id});
        } else {
            console.log("Silent error in updateStateConf");
        }
    }

    @Mutation
    public switchFuse(id: string) {
        const currState = _getFuseState(this, id);
        const realId = this.fuseIdx.get(id);
        if(realId !== undefined) {
            Vue.set(this.fusesUStatusState, realId, {state: oppositeState(currState), fuseId: id});
        } else {
            console.log("Silent error in switchFuse");
        }
    }

    @Mutation
    public deleteMeter(meterId: string) {
        const id = this.meterIdx.get(meterId) as number;

        this.grid.meters.get(meterId)?.cable?.delMeter(meterId);
        this.meterIdx.delete(meterId);
        this.grid.meters.delete(meterId);


        for(let i = id; i <this.metersCons.length - 1; i++) {
            this.metersCons[i] = this.metersCons[i+1];
            this.meterIdx.set(this.metersCons[i].meterId, i);
        }

    }

    @Mutation
    public deleteCable(cableId: string) {
        _deleteCable(this, cableId);
    }

    @Mutation
    public deleteEntity(entityId: string) {
        console.log("ici");
        const entity = this.grid.entities?.get(entityId);
        if(entity !== undefined) {
            entity.fuses.forEach((fuse: Fuse) => {
                const cable = fuse.cable;
               _deleteCable(this, cable.id);
            });
            entity.deleteAllFuses();
            this.grid.entities?.delete(entityId);
        }
    }
}

