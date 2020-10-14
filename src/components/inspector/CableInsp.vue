<template lang="pug">
    div
        ListFuses
        h4.collapseAct(v-on:click="show($event)" class="active") Meters
        .collapsible
          MeterInsp(v-for="m in getMetersData()" :key="m.id" :meterId="m.meterId")
        h4.collapseAct(v-on:click="show($event)" class="active") ULoads
        .collapsible
            span(v-for="ul in getCableULoads()" :key="ul.id")  - {{ul.value}} A [{{ul.confidence}}] <br/>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import {namespace} from "vuex-class";
    import {ULoadInfo, uLoadsData} from "@/utils/uLoadsUtils";
    import {Selection} from "@/utils/selection";
    import {Cable, Grid, Meter, ULoad} from "@/ts/grid";
    import FuseInsp from "@/components/inspector/FuseInsp.vue";
    import {open} from "@/utils/collapse-utils";
    import ListFuses from "@/components/inspector/ListFuses.vue";
    import MeterInsp from "@/components/inspector/MeterInsp.vue";

    const inspectorState = namespace('InspectorState');
    const gridState = namespace('GridState');

    interface MeterData {
      id: number;
      meterId: string;
      name: string;
    }


    @Component({
        components: {MeterInsp, ListFuses, FuseInsp}
    })
    export default class CableInsp extends Vue {

        @inspectorState.State
        public selectedElement!: Selection;

        @gridState.Getter
        public cableULoads!: (id: string) => Array<ULoad>;

        @gridState.Getter
        public meters!: (cableId: string) => Array<Meter>;


        @gridState.State
        public grid!: Grid;


        public getCableULoads(): Array<ULoadInfo> {
            return uLoadsData(this.cableULoads(this.selectedElement.id));
        }

        public getMetersData(): Array<MeterData> {
          const res = new Array<MeterData>();

          this.meters(this.selectedElement.id).forEach((meter: Meter, idx: number) => {
            res.push({id: idx, meterId: meter.id, name: meter.name})
          });

          return res;
        }

        get fusesId(): Array<string> {
            const cable = this.grid.cables.get(this.selectedElement.id) as Cable;
            return [cable.fuse1.id, cable.fuse2.id]
        }

        public show(event: MouseEvent) {
            open(event);
        }


    }
</script>

<style scoped lang="scss">
    @import "@/scss/fuseInsp.scss";

    #fuseInfo {
        text-align: left;
    }

    .collapsible {
      div {
        margin-bottom: 10px;
      }
    }

    .line {
        width: 95%;
        margin: 10px auto;
        height: 2px;
        background-color: grey;
        display: block;
    }

    h4 {
        margin-bottom: 0;
    }
</style>