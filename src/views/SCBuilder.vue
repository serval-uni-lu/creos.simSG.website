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
        Inspector#inspector


</template>


<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
    import Action from "@/components/Action.vue";
    import Inspector from "@/components/inspector/Inspector.vue";
    import {Network, Edge, Node, DataSet} from "vis-network/standalone";
    import {Point} from "@/utils/svg-types";

    enum EditionMode {
      NONE = "None", ADD_SUB = "substation", ADD_CABINET = "cabinet", ADD_CABLE = "cable"
    }

    @Component({
      components: {Inspector, Action}
    })
    export default class Scenarios extends Vue {
      public nodes: DataSet<Node> = new DataSet<Node>();
      public edges: DataSet<Edge> = new DataSet<Edge>();
      public nextNodeId = 0;
      public editionMode: EditionMode = EditionMode.NONE;

      public network!: Network;
      public selection: EditionMode = EditionMode.NONE;

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

        this.edges.on("add", () => this.editionMode = EditionMode.NONE)

        this.network.on("selectNode", (params) => {
          console.log(params)
          const id = params.nodes[0];
          const node = this.nodes.get(id) as any;
          if(node.group === "substation") {
            this.selection = EditionMode.ADD_SUB;
          } else {
            this.selection = EditionMode.ADD_CABINET;
          }
        });

        this.network.on("selectEdge", (params) => {
          if(params.nodes.length === 0) {
            this.selection = EditionMode.ADD_CABLE;
          }
        });

        this.network.on("deselectNode", (params) => {
          console.log(params);
          if(params.edges.length !== 0) {
            this.selection = EditionMode.ADD_CABLE
          } else {
            this.selection = EditionMode.NONE;
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
          }
        });


      }



      public addNode(localisation: Point) {
        if(this.editionMode === EditionMode.ADD_SUB || this.editionMode === EditionMode.ADD_CABINET ) {
          this.nodes.add({
            id: this.nextNodeId,
            x: localisation.x,
            y: localisation.y,
            group: this.editionMode
          })
          this.nextNodeId++;
          this.editionMode = EditionMode.NONE;
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
      }

      public fit() {
        this.network.fit({
          animation: true
        });
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