import {Module, Mutation, VuexModule} from "vuex-module-decorators";
import {GridData, scenario2Grid} from "@/utils/grid-utils";
import {Scenario} from "@/ts/scenario";
import {Cable, ConfidenceLevel, Fuse, Grid, Meter, oppositeState, State, ULoad} from "@/ts/grid";
import {Vue} from "vue-property-decorator";

export interface UpdateNumVal {
    id: number;
    newValue: number;
}


export interface UpdateState {
    id: number;
    newState: State;
}

const NULL_GRID: Grid = new Grid(
    new Map<number, Cable>(),
    new Map<number, Fuse>(),
    new Map<number, Meter>()
);

export function fuseIsClosed(fuseUStatusState: Map<number, State>, id: number): boolean {
    return fuseUStatusState.get(id) === State.CLOSED;
}

export function getFuseStatusConf(fuseUStatusConf: Map<number, ConfidenceLevel>, id: number): number {
    const conf: ConfidenceLevel|undefined = fuseUStatusConf.get(id);
    return (conf === undefined)? -1 : conf.level;
}

export function getFuseStatusConfStr(fuseUStatusConf: Map<number, ConfidenceLevel>, id: number): string {
    const conf: ConfidenceLevel|undefined = fuseUStatusConf.get(id);
    return (conf === undefined)? "-1" : conf.prettyConf();
}

export function getFuseState(fuseUStatusState: Map<number, State>, id: number): State {
    const status: State | undefined = fuseUStatusState.get(id);
    return (status === undefined)? State.CLOSED: status;
}

export function getConsumption(meterCons: Map<number, number>, meterId: number): number {
    const cons: number | undefined = meterCons.get(meterId);
    return (cons === undefined)? 0 : cons;
}



@Module({namespaced: true})
export default class GridState extends VuexModule {
    public grid: Grid = NULL_GRID;


    public meterCons = new Map<number, number>();
    public fuseUStatusState = new Map<number, State>();
    public fuseUStatusConf = new Map<number, ConfidenceLevel>();

    public fuseULoads = new Map<number, Array<ULoad>>();
    public cableULoads = new Map<number, Array<ULoad>>();

    @Mutation
    public initFromScenario(scenario: Scenario) {
        const info: GridData = scenario2Grid(scenario);

        this.grid = info.staticInfo;
        this.meterCons = info.meterCons;
        this.fuseUStatusConf = info.fuseConf;
        this.fuseUStatusState = info.fuseStates;
    }

    @Mutation
    public updateConsumption(data: UpdateNumVal) {
        Vue.set(this.meterCons, data.id, data.newValue);
    }

    @Mutation
    public updateStateConf(data: UpdateNumVal) {
        Vue.set(this.fuseUStatusConf, data.id, new ConfidenceLevel(data.newValue));
    }

    @Mutation
    public updateState(data: UpdateState) {
        Vue.set(this.fuseUStatusState, data.id, data.newState);
    }

    @Mutation
    public setToOppositeState(id: number) {
        const state: State = this.fuseUStatusState.get(id) as State;
        const conf: ConfidenceLevel = this.fuseUStatusConf.get(id) as ConfidenceLevel;
        this.updateState({id: id, newState: oppositeState(state)});
        this.updateStateConf({id: id, newValue: conf.oppositeLevel()});
    }

    @Mutation
    public switchFuse(id: number) {
        const currState = getFuseState(this.fuseUStatusState, id);
        console.log("OK " + id);
        console.log(this.fuseUStatusState);
        console.log(oppositeState(currState));
        Vue.set(this.fuseUStatusState, id, oppositeState(currState));
        console.log(this.fuseUStatusState);
        this.fuseUStatusState.set(id, oppositeState(currState));
        console.log(this.fuseUStatusState);
    }




    // public grid: Grid = NULL_GRID;
    //
    // @Mutation
    // public initFromJson(json: GridJson) {
    //     this.grid = json2Grid(json);
    // }
    //
    // @Mutation
    // public initFromScenario(scenario: Scenario) {
    //     this.grid = scenario2Grid(scenario);
    // }
    //
    // @Mutation
    // public switchFuse(id: number) {
    //     const currFuse = this.grid.getFuse(id);
    //     const oppStatus = currFuse.status.opposite();
    //     Vue.set(this.grid.fuses, id, new Fuse(currFuse.id, oppStatus.state, oppStatus.confidence.level));
    // }
    //
    // @Mutation
    // public updateMeterCons(data: UpdateConsData) {
    //     console.log(this.grid.meters);
    //     const currentMeter = this.grid.getMeter(data.id);
    //     Vue.set(this.grid.meters, data.id, new Meter(currentMeter.name, data.newCons, currentMeter.latitude, currentMeter.longitude));
    //     console.log(this.grid.meters);
    //
    // }


}