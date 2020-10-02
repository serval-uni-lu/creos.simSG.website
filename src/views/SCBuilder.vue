<template lang="pug">
    section
      h2 Topology builder

      .toolbar
        img.cblFuseLayer.btn.btn-secondary(src="@/assets/buttons/addSubs.svg" title="Add a substation" v-on:click="setAddSubMode()" v-bind:class="{active: editionIsSub}")
        img.cblFuseLayer.btn.btn-secondary(src="@/assets/buttons/addCabinet.svg" title="Add a cabinet" v-on:click="setAddSubCabinet()" v-bind:class="{active: editionIsCab}")
        img.cblFuseLayer.btn.btn-secondary(src="@/assets/buttons/addCable.svg" title="Add a cable" v-on:click="setAddCable()" v-bind:class="{active: editionIsCable}")
        img.cblFuseLayer.btn.btn-secondary(src="@/assets/buttons/addMeter.svg" title="Add a meter" v-on:click="setAddMeter()" v-bind:class="{active: editionIsMeter}")
        img.cblFuseLayer.btn.btn-secondary(:src="imageDel" :title="titleDel" class="btn btn-secondary" v-on:click="deleteElmt()" v-if="elmtSelected")
        img.cblFuseLayer.btn.btn-secondary(src="@/assets/buttons/fitGrid.svg" title="Fit the grid in the window" class="btn btn-secondary" v-on:click="fit()")
        img.cblFuseLayer.btn.btn-secondary(src="@/assets/buttons/download.svg" title="Export the grid to a JSON file" v-on:click="download()")
        .cblFuseLayer.btn.btn-secondary
          label(for="upload-button")
            img(src="@/assets/buttons/upload.svg" title="Upload the grid from a JSON file")
          input#upload-button(type="file" style="display: none;" v-on:change="upload($event)")
        img.cblFuseLayer.btn.btn-secondary(src="@/assets/buttons/deleteAll.svg" title="Delete all the grid" v-on:click="deleteAll()")

      #viewer
        Action#action
        .topo-builder
          #network
        EditableInspector#inspector(v-if="inspVisible")


</template>


<script lang="ts">
    import {Component, Vue, Watch} from "vue-property-decorator";
    import Action from "@/components/Action.vue";
    import {DataSet, Edge, IdType, Network, Node, Position} from "vis-network/standalone";
    import {Point} from "@/utils/svg-types";
    import {namespace} from "vuex-class";
    import {Cable, Entity, EntityType, Fuse, Grid, Meter} from "@/ts/grid";
    import {ElmtType, NullSelection, Selection} from "@/utils/selection";
    import EditableInspector from "@/components/inspector/editable/EditableInspector.vue";
    import {DataConnCblMeter, DataNewCable, DataNewEntity} from "@/store/modules/grid-state";
    import {GridJson} from "@/types/sg-json.types";
    import {saveAs} from 'file-saver';
    import {v4 as uuidv4} from 'uuid';

    enum TypeNode {
      NONE = "None", SUB = "substation", CABINET = "cabinet", CABLE = "cable", METER = "meter"
    }

    const gridState = namespace("GridState");
    const inspectorState = namespace('InspectorState');

    @Component({
      components: {EditableInspector, Action}
    })
    export default class SCBuilder extends Vue {
      public nodes: DataSet<Node> = new DataSet<Node>();
      public edges: DataSet<Edge> = new DataSet<Edge>();
      // public nextNodeId = 0;
      // public nextCableId = -1;
      public editionMode: TypeNode = TypeNode.NONE;
      public selection: TypeNode = TypeNode.NONE;
      public network!: Network;

      /**
       * Inspector state
       */
      @inspectorState.State
      public selectedElement!: Selection;

      @inspectorState.Mutation
      public select!: (elmt: Selection) => void;

      @inspectorState.Mutation
      public reset!: () => void;

      /**
       * Grid state
       */
      @gridState.State
      public grid!: Grid;

      @gridState.Getter
      public gridJson!: string;

      @gridState.Mutation
      public initEmpty!: () => void;

      @gridState.Mutation
      public addEntity!: (data: DataNewEntity) => void;

      @gridState.Mutation
      public addCable!: (data: DataNewCable) => void;

      @gridState.Mutation
      public addMeter!: (id: string) => void;

      @gridState.Mutation
      public connectMeter2Cable!: (data: DataConnCblMeter) => void;

      @gridState.Mutation
      public initFromJson!: (json: GridJson) => void;

      public get inspVisible(): boolean {
        return !this.selectedElement.equals(NullSelection);
      }

      public get elmtSelected(): boolean {
        return this.selection !== TypeNode.NONE;
      }

      public get imageDel(): string {
        if (this.selection === TypeNode.SUB) {
          return require("@/assets/buttons/delSubs.svg");
        } else if (this.selection === TypeNode.CABINET) {
          return require("@/assets/buttons/delCabinet.svg");
        } else if (this.selection === TypeNode.CABLE) {
          return require("@/assets/buttons/delCable.svg");
        } else if (this.selection === TypeNode.METER) {
          return require("@/assets/buttons/delMeter.svg");
        }
        return "";
      }

      public get titleDel(): string {
        return "Delete " + this.selection;
      }

      public get editionIsSub(): boolean {
        return this.editionMode === TypeNode.SUB;
      }

      public get editionIsCab(): boolean {
        return this.editionMode === TypeNode.CABINET;
      }

      public get editionIsCable(): boolean {
        return this.editionMode === TypeNode.CABLE;
      }

      public get editionIsMeter(): boolean {
        return this.editionMode === TypeNode.METER;
      }

      public download() {
        const blob = new Blob([this.gridJson], {type: "application/json;charset=utf-8"});
        saveAs(blob, "grid.json");
      }

      public upload(event: Event) {
        const file = (event.target as HTMLInputElement).files?.item(0);
        if (file !== null) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            try {
              const gridJson: GridJson = JSON.parse(evt.target?.result as string) as GridJson;
              this.initFromJson(gridJson);

              const fuseEntityMap: Map<string, string> = new Map<string, string>();
              this.grid.entities?.forEach((ent: Entity) => {
                this.nodes.add({
                  group: ent.type.toLowerCase(),
                  id: ent.id,
                });

                ent.fuses.forEach((fuse: Fuse) => {
                  fuseEntityMap.set(fuse.id, ent.id);
                })
              });

              this.grid.meters.forEach((meter: Meter) => {
                this.nodes.add({
                  group: "meter",
                  id: meter.id,
                  x: meter.latitude,
                  y: meter.longitude
                });
              });

              this.grid.cables.forEach((cble: Cable) => {
                const ent1 = this.nodes.get(fuseEntityMap.get(cble.fuse1.id) as string) as Node;
                const ent2 = this.nodes.get(fuseEntityMap.get(cble.fuse2.id) as string) as Node;

                const cableNodeId: IdType[] = this.nodes.add({
                  group: "cable",
                  id: cble.id,
                  x: (ent1.x !== undefined && ent2.x !== undefined) ? (ent1.x + ent2.x) / 2 : 0,
                  y: (ent1.y !== undefined && ent2.y !== undefined) ? (ent1.y + ent2.y) / 2 : 0,
                });


                this.edges.add([{
                  from: ent1.id,
                  to: cableNodeId[0]
                }, {
                  from: cableNodeId[0],
                  to: ent2.id
                }]);

              });


              this.network.stabilize()
              this.fit();

            } catch (err) {
              console.error(err);
            }
          }
          reader.readAsText(file as File);
        }
      }

      public setAddSubMode() {
        this.editionMode = TypeNode.SUB;
      }

      public setAddSubCabinet() {
        this.editionMode = TypeNode.CABINET;
      }

      public setAddMeter() {
        this.editionMode = TypeNode.METER;
      }

      public deleteAll() {
        this.nodes.clear();
        this.reset();
        this.initEmpty();
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
            addEdge: (edgeData: { from: string, to: string }, callback: (data: { from: string, to: string }) => void) => {
              this.editionMode = TypeNode.NONE;
              const from = this.nodes.get(edgeData.from) as Node;
              const to = this.nodes.get(edgeData.to) as Node;

              if (from.id !== to.id && !(from.group === "cable" && to.group === "cable") && !(from.group === "meter" && to.group === "meter")) {
                if ((from.group === "substation" || from.group === "cabinet") && (to.group === "substation" || to.group === "cabinet")) {

                  const ids: IdType[] = this.nodes.add({
                    id: uuidv4(),
                    x: (from.x !== undefined && to.x !== undefined) ? (from.x + to.x) / 2 : 0,
                    y: (from.y !== undefined && to.y !== undefined) ? (from.y + to.y) / 2 : 0,
                    group: "cable"
                  });
                  this.network.addEdgeMode();
                  this.addCable({
                    id: uuidv4(),
                    entityId1: from.id as string,
                    entityId2: to.id as string
                  });
                  // this.nextCableId--;
                  this.edges.add([
                    {from: from.id, to: ids[0]},
                    {from: ids[0], to: to.id}
                  ]);
                  this.reset();
                  this.selection = TypeNode.NONE;
                } else if ((from.group === "meter" && to.group === "cable") || (to.group === "meter" && from.group === "cable")) {
                  const n = this.network.getConnectedNodes(from.id as string) as IdType[];
                  if (!n.includes(to.id as IdType)) {
                    this.edges.add({
                      from: edgeData.from,
                      to: edgeData.to,
                      dashes: true
                    });

                    const data: DataConnCblMeter = (from.group === "cable") ? {
                      cableId: from.id as string,
                      meterId: to.id as string
                    } : {cableId: to.id as string, meterId: from.id as string};
                    this.connectMeter2Cable(data);


                  }
                }
              }
            }
          },
          physics: false
        });

        // eslint-disable-next-line
        this.network.on("click", (params?: any) => {
          if (this.editionMode === TypeNode.SUB || this.editionMode === TypeNode.CABINET || this.editionMode === TypeNode.METER) {
            this.addNode({
              x: params.pointer.canvas.x,
              y: params.pointer.canvas.y
            })
          }
        });

        this.network.on("selectNode", (params) => {
          if (params.nodes.length == 1) {
            const id = params.nodes[0];
            const node = this.nodes.get(id) as Node;
            if (node.group === "substation") {
              this.selection = TypeNode.SUB;
              this.select(new Selection(id, ElmtType.Entity));
              const cables = this.network.getConnectedNodes(node.id as string) as IdType[];
              cables.push(node.id as string);
              this.network.selectNodes(cables, true);
            } else if (node.group === "cabinet") {
              this.selection = TypeNode.CABINET;
              this.select(new Selection(id, ElmtType.Entity));
              const cables = this.network.getConnectedNodes(node.id as string) as IdType[];
              cables.push(node.id as string);
              this.network.selectNodes(cables, true);
            } else if (node.group === "cable") {
              this.selection = TypeNode.CABLE;
              this.select(new Selection(id, ElmtType.Cable));
            } else if (node.group === "meter") {
              this.selection = TypeNode.METER;
              this.select(new Selection(id, ElmtType.Meter));
            }
          }
        });

        this.network.on("selectEdge", (params) => {
          if (params.nodes.length === 0) {
            const edge = this.edges.get(params.edges[0]) as Edge;
            const from = this.nodes.get(edge.from as string) as Node;

            let cableId;
            if (from.group === "cable") {
              this.network.selectNodes([from.id as string], true);
              cableId = from.id as string;
            } else {
              const to = this.nodes.get(edge.to as string) as Node;
              this.network.selectNodes([to.id as string], true);
              cableId = to.id as string;
            }
            this.selection = TypeNode.CABLE;
            this.select(new Selection(cableId, ElmtType.Cable));
          }
        });


        this.network.on("deselectNode", () => {
          this.selection = TypeNode.NONE;
          this.reset();
        });

        this.network.on("dragStart", params => {
          if (params.nodes.length == 1) {
            const id = params.nodes[0];
            const node = this.nodes.get(id) as Node;
            if (node.group === "substation") {
              this.selection = TypeNode.SUB;
              this.select(new Selection(id, ElmtType.Entity));
              const cables = this.network.getConnectedNodes(node.id as string) as IdType[];
              cables.push(node.id as string);
              this.network.selectNodes(cables, true);
            } else if (node.group === "cabinet") {
              this.selection = TypeNode.CABINET;
              this.select(new Selection(id, ElmtType.Entity));
              const cables = this.network.getConnectedNodes(node.id as string) as IdType[];
              cables.push(node.id as string);
              this.network.selectNodes(cables, true);
            } else if (node.group === "cable") {
              this.selection = TypeNode.CABLE;
              this.select(new Selection(id, ElmtType.Cable));
            } else if (node.group === "meter") {
              this.selection = TypeNode.METER;
              this.select(new Selection(id, ElmtType.Meter));
            }
          }
        })


        this.network.on("dragEnd", params => {
          const nodeConnected = new Set<string>();
          params.nodes.forEach((nodeIdx: number) => {
            const node = this.nodes.get(nodeIdx) as Node;
            if (node.group === "cable") {
              const neighbors = this.network.getConnectedNodes(nodeIdx) as IdType[];
              const ent1: Position = this.network.getPosition(neighbors[0]);
              const ent2: Position = this.network.getPosition(neighbors[1]);

              const str = Math.min(ent1.x, ent2.x) + "_" +
                  Math.max(ent1.x, ent2.x) + "//" +
                  Math.min(ent1.y, ent2.y) + "_" +
                  Math.max(ent1.y, ent2.y);
              if (nodeConnected.has(str)) {
                this.network.moveNode(nodeIdx, ((ent1.x + ent2.x) / 2) + 50, ((ent1.y + ent2.y) / 2) + 50);
              } else {
                nodeConnected.add(str);
                this.network.moveNode(nodeIdx, (ent1.x + ent2.x) / 2, (ent1.y + ent2.y) / 2);
              }
            }
          });
        });


      }

      public created() {
        this.initEmpty();
      }

      public addNode(localisation: Point) {
        const id = uuidv4();
        this.nodes.add({
          id: id,
          x: localisation.x,
          y: localisation.y,
          group: this.editionMode
        });
        if (this.editionMode === TypeNode.METER) {
          // this.addMeter(this.nextNodeId);
          this.addMeter(id);
          this.select(new Selection(id, ElmtType.Meter));
        } else {
          const type = (this.editionMode === TypeNode.SUB) ? EntityType.SUBSTATION : EntityType.CABINET;
          this.addEntity({id: id, type: type});
          this.select(new Selection(id, ElmtType.Entity));
        }
        this.network.selectNodes([id], true);
        this.selection = this.editionMode;
        this.editionMode = TypeNode.NONE;

        // this.nextNodeId++;
      }

      public setAddCable() {
        if (this.editionMode !== TypeNode.CABLE) {
          this.network.addEdgeMode();
          this.editionMode = TypeNode.CABLE;
        } else {
          console.log("Oups");
          this.network.disableEditMode();
          this.editionMode = TypeNode.NONE;
        }
      }

      public deleteElmt() {
        this.network.deleteSelected();
        this.selection = TypeNode.NONE;
        this.select(NullSelection);
      }

      public fit() {
        this.network.fit({
          animation: true
        });
      }

      @Watch("selectedElement")
      public selectionChanged() {
        if (this.selectedElement.equals(NullSelection)) {
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