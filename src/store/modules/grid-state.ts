import {Module, Mutation, VuexModule} from "vuex-module-decorators";
import {GridJson} from "@/types/sg-json.types";
import {json2Grid, scenario2Grid} from "@/utils/grid-utils";
import {Scenario} from "@/ts/scenario";
import {Cable, Entity, Fuse, Grid, Meter} from "@/ts/grid";
import {Vue} from "vue-property-decorator";
import {Util} from "leaflet";
import formatNum = Util.formatNum;


export interface UpdateConsData {
    id: number;
    newCons: number;
}

const NULL_GRID: Grid = new Grid(
    new Array<Cable>(),
    new Array<Fuse>(),
    new Array<Meter>()
);

@Module({namespaced: true})
export default class GridState extends VuexModule {
    public grid: Grid = NULL_GRID;

    @Mutation
    public initFromJson(json: GridJson) {
        this.grid = json2Grid(json);
    }

    @Mutation
    public initFromScenario(scenario: Scenario) {
        this.grid = scenario2Grid(scenario);
    }

    @Mutation
    public switchFuse(id: number) {
        const currFuse = this.grid.getFuse(id);
        const oppStatus = currFuse.status.opposite();
        Vue.set(this.grid.fuses, id, new Fuse(currFuse.id, oppStatus.state, oppStatus.confidence.level));
    }

    @Mutation
    public updateMeterCons(data: UpdateConsData) {
        console.log(this.grid.meters);
        const currentMeter = this.grid.getMeter(data.id);
        Vue.set(this.grid.meters, data.id, new Meter(currentMeter.name, data.newCons, currentMeter.latitude, currentMeter.longitude));
        console.log(this.grid.meters);

    }


}