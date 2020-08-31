import {Module, Mutation, VuexModule} from "vuex-module-decorators";
import {GridJson} from "@/types/sg-json.types";
import {json2Grid, scenario2Grid} from "@/utils/grid-utils";
import {Scenario} from "@/ts/scenario";
import {Cable, Entity, Fuse, Grid, Meter} from "@/ts/grid";
import {Vue} from "vue-property-decorator";

@Module({namespaced: true})
export default class GridState extends VuexModule {
   public grid!: Grid;
   // public meters!: Array<Meter>;
   public meters!: Array<number>;

   @Mutation
    public initFromJson(json: GridJson) {
       this.grid = json2Grid(json);
   }

   @Mutation
    public initFromScenario(scenario: Scenario) {
       this.grid = scenario2Grid(scenario);
       // this.meters = this.grid.meters as Array<Meter>;
       this.meters = new Array<number>();
       this.meters.push(5);
   }

    @Mutation
    public switchFuse(id: number): void {
        const currFuse = this.grid.getFuse(id);
        const oppStatus = currFuse.status.opposite();
        Vue.set(this.grid.fuses, id, new Fuse(currFuse.id, oppStatus.state, oppStatus.confidence.level));
    }

    @Mutation
    public updateMeterCons(id: number, newCons: number) {
       // console.log(2);
       // const meter = this.meters[id];
       //
        console.log("updateMeterCons");
        console.log(id + "/" + newCons);
       console.log(this.meters);
       const curr = this.meters[id];
       console.log(Vue.set(this.meters, id, curr + 1));
       console.log(this.meters);
        console.log("----END----");
    }


}