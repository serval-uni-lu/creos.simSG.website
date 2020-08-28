import {Module, Mutation, VuexModule} from "vuex-module-decorators";
import {GridJson} from "@/utils/sg-json.types";

@Module({namespaced: true})
export default class GridState extends VuexModule {
   public grid!: GridJson;

   @Mutation
    public init(json: GridJson) {
       this.grid = json;
   }

}