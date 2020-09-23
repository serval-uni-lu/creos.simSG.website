<template lang="pug">
    section
      h2 Topology builder

      .toolbar
        img.cblFuseLayer(src="@/assets/buttons/addSubs.svg" title="Add a substation" class="btn btn-secondary" v-on:click="setAddSubMode()" v-bind:class="{active: addSubActive}")
        img.cblFuseLayer(src="@/assets/buttons/addCabinet.svg" title="Add a cabinet" class="btn btn-secondary" v-on:click="setAddSubCabinet()" v-bind:class="{active: addCabActive}")
        img.cblFuseLayer(src="@/assets/buttons/addCable.svg" title="Add a cable" class="btn btn-secondary" v-on:click="setAddCable()" v-bind:class="{active: addCableActive}")
        img.cblFuseLayer(src="@/assets/buttons/addMeter.svg" title="Add a meter" class="btn btn-secondary" v-on:click="setAddMeter()" v-bind:class="{active: addMeterActive}")
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
import {DataSet, Edge, IdType, Network, Node} from "vis-network/standalone";
import {Point} from "@/utils/svg-types";
import {namespace} from "vuex-class";
import {EntityType} from "@/ts/grid";
import {ElmtType, NullSelection, Selection} from "@/utils/selection";
import EditableInspector from "@/components/inspector/editable/EditableInspector.vue";
import {DataConnCblMeter, DataNewCable, DataNewEntity} from "@/store/modules/grid-state";

enum EditionMode {
      NONE = "None", ADD_SUB = "substation", ADD_CABINET = "cabinet", ADD_CABLE = "cable", ADD_METER = "meter"
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
      public nextCableId = -1;
      public editionMode: EditionMode = EditionMode.NONE;

      public network!: Network;
      public selection: EditionMode = EditionMode.NONE;

      @gridState.Mutation
      public initEmpty!: () => void;

      @gridState.Mutation
      public addEntity!: (data: DataNewEntity) => void;

      @gridState.Mutation
      public addCable!: (data: DataNewCable) => void;

      @gridState.Mutation
      public addMeter!: (id: number) => void;

      @gridState.Mutation
      public connectMeter2Cable!: (data: DataConnCblMeter) => void;

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
        } else if(this.selection === EditionMode.ADD_METER) {
          return require("@/assets/buttons/delMeter.svg");
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

      public get addMeterActive(): boolean {
        return this.editionMode === EditionMode.ADD_METER;
      }

      public setAddSubMode() {
        this.editionMode = EditionMode.ADD_SUB;
      }

      public setAddSubCabinet() {
        this.editionMode = EditionMode.ADD_CABINET;
      }

      public setAddMeter() {
        this.editionMode = EditionMode.ADD_METER;
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
            },
            meter: {
              image: {
                unselected: require("@/assets/logos/grids/meter.svg"),
                selected: require("@/assets/logos/grids/meter-selected.svg")
              },
              shape: "circularImage",
              color: {
                border: "#FFB347"
              }
            },
            cable: {
              shape: "dot",
              color: {
                highlight: "#6F2683",
                background: "black",
                border: "black"
              },
              size: 5
            }
          },
          edges: {
            color: {
              color: "black",
              highlight: "#6F2683"
            },
            width: 3,
            smooth: false,
          },
          nodes: {
            color: {
              highlight: {
                border: "#6F2683"
              }
            }
          },
          manipulation: {
            enabled: false,
            // eslint-disable-next-line
            addEdge: (edgeData: {from: number, to: number}, callback: (data: {from: number, to: number}) => void) => {
              this.editionMode = EditionMode.NONE;
              const from = this.nodes.get(edgeData.from) as Node;
              const to = this.nodes.get(edgeData.to) as Node;

              if(from.id !== to.id && !(from.group === "cable" && to.group === "cable") && !(from.group === "meter" && to.group === "meter")) {
                if((from.group === "substation" || from.group === "cabinet") && (to.group === "substation" || to.group === "cabinet")) {
                  const ids: IdType[] = this.nodes.add({
                    id: this.nextCableId,
                    x: (from.x !== undefined) ? from.x + 10 : 0,
                    y: (from.y !== undefined) ? from.y + 10 : 0,
                    group: "cable"
                  });
                  this.network.addEdgeMode();
                  this.addCable({
                    id: this.nextCableId,
                    entityId1: from.id as number,
                    entityId2: to.id as number
                  });
                  this.nextCableId--;
                  this.edges.add([
                    {from: from.id, to: ids[0]},
                    {from: ids[0], to: to.id}
                  ]);
                  this.reset();
                  this.selection = EditionMode.NONE;
                } else if((from.group === "meter" && to.group === "cable") || (to.group === "meter" && from.group === "cable")) {
                  const n = this.network.getConnectedNodes(from.id as number) as IdType[];
                  if (!n.includes(to.id as IdType)) {
                    this.edges.add({
                      from: edgeData.from,
                      to: edgeData.to,
                      dashes: true
                    });

                    const data: DataConnCblMeter = (from.group === "cable")? {cableId: from.id as number, meterId: to.id as number} : {cableId: to.id as number, meterId: from.id as number};
                    this.connectMeter2Cable(data);


                  }
                }
              }
            }
          }
        });

        // eslint-disable-next-line
        this.network.on("click", (params?: any) => {
          if(this.editionMode === EditionMode.ADD_SUB || this.editionMode === EditionMode.ADD_CABINET || this.editionMode === EditionMode.ADD_METER) {
            this.addNode({
              x: params.pointer.canvas.x,
              y: params.pointer.canvas.y
            })
          }
        });

        this.network.on("selectNode", (params) => {

          if(params.nodes.length == 1) {
            const id = params.nodes[0];
            const node = this.nodes.get(id) as Node;
            if (node.group === "substation") {
              this.selection = EditionMode.ADD_SUB;
              this.select(new Selection(id, ElmtType.Entity));
              const cables = this.network.getConnectedNodes(node.id as number) as IdType[];
              cables.push(node.id as number);
              this.network.selectNodes(cables, true);
            } else if (node.group === "cabinet") {
              this.selection = EditionMode.ADD_CABINET;
              this.select(new Selection(id, ElmtType.Entity));
              const cables = this.network.getConnectedNodes(node.id as number) as IdType[];
              cables.push(node.id as number);
              this.network.selectNodes(cables, true);
            } else if(node.group === "cable") {
              this.selection = EditionMode.ADD_CABLE;
              this.select(new Selection(id, ElmtType.Cable));
            } else if(node.group === "meter") {
              this.selection = EditionMode.ADD_METER;
              this.select(new Selection(id, ElmtType.Meter));
            }
          }
        });

        this.network.on("selectEdge", (params) => {
          if(params.nodes.length === 0) {
            const edge = this.edges.get(params.edges[0]) as Edge;
            const from = this.nodes.get(edge.from as number) as Node;

            let cableId;
            if(from.group === "cable") {
              this.network.selectNodes([from.id as number], true);
              cableId = from.id as number;
            } else {
              const to = this.nodes.get(edge.to as number) as Node;
              this.network.selectNodes([to.id as number], true);
              cableId = to.id as number;
            }
            this.selection = EditionMode.ADD_CABLE;
            this.select(new Selection(cableId, ElmtType.Cable));
          }
        });

        this.network.startSimulation()

        this.network.on("deselectNode", () => {
          this.selection = EditionMode.NONE;
          this.reset();
        });


      }

      public created() {
        this.initEmpty();
      }

      public test() {
        this.network.selectNodes([0], true);
      }


      public addNode(localisation: Point) {
          this.nodes.add({
            id: this.nextNodeId,
            x: localisation.x,
            y: localisation.y,
            group: this.editionMode
          });
          if(this.editionMode === EditionMode.ADD_METER) {
            this.addMeter(this.nextNodeId);
            this.select(new Selection(this.nextNodeId, ElmtType.Meter));
          } else {
            const type = (this.editionMode === EditionMode.ADD_SUB) ? EntityType.SUBSTATION : EntityType.CABINET;
            this.addEntity({id: this.nextNodeId, type: type});
            this.select(new Selection(this.nextNodeId, ElmtType.Entity));
          }
          this.network.selectNodes([this.nextNodeId], true);
          this.selection = this.editionMode;
          this.editionMode = EditionMode.NONE;

          this.nextNodeId++;
      }

      public setAddCable() {
        if(this.editionMode !== EditionMode.ADD_CABLE) {
          this.network.addEdgeMode();
          this.editionMode = EditionMode.ADD_CABLE;
        } else {
          console.log("Oups");
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