<template lang="pug">
    section
      h2 Topology builder

      .toolbar
        img.cblFuseLayer(src="@/assets/buttons/addSubs.svg" title="Add a substation" class="btn btn-secondary" v-on:click="setAddSubMode()" v-bind:class="{active: addSubActive}")
        img.cblFuseLayer(src="@/assets/buttons/addCabinet.svg" title="Add a cabinet" class="btn btn-secondary" v-on:click="setAddSubCabinet()" v-bind:class="{active: addCabActive}")
        img.cblFuseLayer(src="@/assets/buttons/addCable.svg" title="Add a cable" class="btn btn-secondary" v-on:click="setAddCable()" v-bind:class="{active: addCableActive}")
        img.cblFuseLayer(:src="imageDel" :title="titleDel" class="btn btn-secondary" v-on:click="deleteElmt()" v-if="elmtSelected")
        img.cblFuseLayer(src="@/assets/buttons/fitGrid.svg" title="Fit the grid in the window" class="btn btn-secondary" v-on:click="fit()")

      #viewer
        Action#action
        .topo-builder
          #network
        EditableInspector#inspector(v-if="inspVisible")


</template>


<script lang="ts">
import {Component, Vue, Watch} from "vue-property-decorator";
import Action from "@/components/Action.vue";
import {DataSet, Edge, Network, Node} from "vis-network/standalone";
import {Point} from "@/utils/svg-types";
import {namespace} from "vuex-class";
import {EntityType} from "@/ts/grid";
import {ElmtType, NullSelection, Selection} from "@/utils/selection";
import EditableInspector from "@/components/inspector/editable/EditableInspector.vue";
import {DataNewCable, DataNewEntity} from "@/store/modules/grid-state";
import {AddEventPayload} from "vis-data/declarations/data-interface";

enum EditionMode {
      NONE = "None", ADD_SUB = "substation", ADD_CABINET = "cabinet", ADD_CABLE = "cable"
    }

    const gridState = namespace("GridState");
    const inspectorState = namespace('InspectorState');

    @Component({
      components: {EditableInspector, Action}
    })
    export default class SCBuilder extends Vue {
      public nodes: DataSet<Node> = new DataSet<Node>();
      public edges: DataSet<Edge> = new DataSet<Edge>();
      public nextNodeId = 0;
      public editionMode: EditionMode = EditionMode.NONE;

      public network!: Network;
      public selection: EditionMode = EditionMode.NONE;

      @gridState.Mutation
      public initEmpty!: () => void;

      @gridState.Mutation
      public addEntity!: (data: DataNewEntity) => void;

      @gridState.Mutation
      public addCable!: (data: DataNewCable) => void;

      @inspectorState.State
      public selectedElement!: Selection;

      @inspectorState.Mutation
      public select!: (elmt: Selection) => void;

      @inspectorState.Mutation
      public reset!: () => void;

      get  inspVisible(): boolean {
        return !this.selectedElement.equals(NullSelection);
      }

      public get elmtSelected(): boolean {
        return this.selection !== EditionMode.NONE;
      }

      public get imageDel(): string {
        if(this.selection === EditionMode.ADD_SUB) {
          return require("@/assets/buttons/delSubs.svg");
        } else if(this.selection === EditionMode.ADD_CABINET) {
          return require("@/assets/buttons/delCabinet.svg");
        } else if(this.selection === EditionMode.ADD_CABLE) {
          return require("@/assets/buttons/delCable.svg");
        }
        return "";
      }

      public get titleDel(): string {
        return "Delete " + this.selection;
      }

      public get addSubActive(): boolean {
        return this.editionMode === EditionMode.ADD_SUB;
      }

      public get addCabActive(): boolean {
        return this.editionMode === EditionMode.ADD_CABINET;
      }

      public get addCableActive(): boolean {
        return this.editionMode === EditionMode.ADD_CABLE;
      }

      public setAddSubMode() {
        this.editionMode = EditionMode.ADD_SUB;
      }

      public setAddSubCabinet() {
        this.editionMode = EditionMode.ADD_CABINET;
      }

      public mounted() {
        const container = document.getElementById('network') as HTMLElement;

        const data = {
          nodes: this.nodes,
          edges: this.edges
        };

        this.network = new Network(container, data, {
          groups: {
            substation: {
              image: {
                unselected: require("@/assets/logos/grids/substation.svg"),
                selected: require("@/assets/logos/grids/substation-selected.svg")
              },
              shape: "circularImage",
              color: {
                border: "#2B92D1"
              }
            },
            cabinet: {
              image: {
                unselected: require("@/assets/logos/grids/cabinet.svg"),
                selected: require("@/assets/logos/grids/cabinet-selected.svg"),
              },
              shape: "circularImage",
              color: {
                border: "#FF140B"
              }
            }
          },
          edges: {
            color: {
              color: "black",
              highlight: "#6F2683"
            },
            width: 3
          },
          nodes: {
            color: {
              highlight: {
                border: "#6F2683"
              }
            }
          }
        });

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        this.network.on("click", (params?: any) => {
          this.addNode({
            x: params.pointer.canvas.x,
            y: params.pointer.canvas.y
          })
        });

        this.edges.on("add", (name: "add", payload: AddEventPayload | null) => {
          this.editionMode = EditionMode.NONE;
          if(payload !== null) {
            const edge = this.edges.get(payload.items[0]) as Edge;
            this.addCable({
              id: payload.items[0] as string,
              entityId1: edge.from as number,
              entityId2: edge.to as number
            });
            this.reset();
          }
        });

        this.network.on("selectNode", (params) => {
          const id = params.nodes[0];
          const node = this.nodes.get(id) as any;
          if(node.group === "substation") {
            this.selection = EditionMode.ADD_SUB;
          } else {
            this.selection = EditionMode.ADD_CABINET;
          }
          this.select(new Selection(id, ElmtType.Entity))
        });

        this.network.on("selectEdge", (params) => {
          if(params.nodes.length === 0) {
            this.selection = EditionMode.ADD_CABLE;
            this.select(new Selection(params.edges[0], ElmtType.Cable));
          }
        });

        this.network.on("deselectNode", (params) => {
          if(params.edges.length !== 0) {
            this.selection = EditionMode.ADD_CABLE
          } else {
            this.selection = EditionMode.NONE;
            this.reset();
          }
        });

        this.network.on("deselectEdge", (params) => {
          if(params.nodes.length !== 0) {
            const id = params.nodes[0];
            const node = this.nodes.get(id) as any;
            if(node.group === "substation") {
              this.selection = EditionMode.ADD_SUB;
            } else {
              this.selection = EditionMode.ADD_CABINET;
            }
          } else {
            this.selection = EditionMode.NONE;
            this.reset();
          }
        });

      }

      public created() {
        this.initEmpty();
      }

      public test() {
        this.network.selectNodes([0], true);
      }


      public addNode(localisation: Point) {
        if(this.editionMode === EditionMode.ADD_SUB || this.editionMode === EditionMode.ADD_CABINET ) {
          this.nodes.add({
            id: this.nextNodeId,
            x: localisation.x,
            y: localisation.y,
            group: this.editionMode
          });
          const type = (this.editionMode === EditionMode.ADD_SUB)? EntityType.SUBSTATION : EntityType.CABINET;
          this.addEntity({id: this.nextNodeId, type: type});
          this.network.selectNodes([this.nextNodeId], true);
          this.selection = this.editionMode;
          this.editionMode = EditionMode.NONE;
          this.select(new Selection(this.nextNodeId, ElmtType.Entity))
          this.nextNodeId++;
        }
      }

      public setAddCable() {
        if(this.editionMode !== EditionMode.ADD_CABLE) {
          this.network.addEdgeMode();
          this.editionMode = EditionMode.ADD_CABLE;
        } else {
          this.network.disableEditMode();
          this.editionMode = EditionMode.NONE;
        }
      }

      public deleteElmt() {
        this.network.deleteSelected();
        this.selection = EditionMode.NONE;
        this.select(NullSelection);
      }

      public fit() {
        this.network.fit({
          animation: true
        });
      }

      @Watch("selectedElement")
      public selectionChanged() {
        if(this.selectedElement.equals(NullSelection)) {
          this.network.setSelection({nodes: [], edges: []})
        }
      }


    }
</script>

<style lang="scss" scoped>
    @import "@/scss/viewer.scss";
    $remaining: calc(100% - (#{$margin} + #{$size-side-elmt}) * 2 - (#{$margin} * 2));

    .btn-secondary, .btn-secondary, .btn-primary:visited {
      background-color: lightgray !important;
      border-color: lightgray !important;
    }

    .btn-secondary.active, .btn-secondary:hover {
      background-color: gray !important;
      border-color: gray !important;
    }

    h2 {
        text-align: center;
    }

    .toolbar {
      margin-bottom: 10px;
    }



  .topo-builder {
    width: $remaining;
    margin-bottom: $margin-bottom;
    margin-left: $margin;
    margin-right: $margin;
    border: 1px solid black;
    display: flex;
    flex-direction: column;
  }

  #network {
    height: 0;
    flex: 1 1 auto;
  }

  .cblFuseLayer {
    margin-left: 3px;
    margin-right: 3px;
    width:  40px;
    height: 40px;
    padding: 3px;
  }

</style>