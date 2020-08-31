<template lang="pug">
    div
        | Consumption:
        input(type="number", min="0", step="1", v-model.number="consumption")
</template>

<script lang="ts">

    import {Component, Vue} from "vue-property-decorator";
    import {namespace} from "vuex-class";
    import {Selection} from "@/utils/selection";
    import {Grid} from "@/ts/grid";

    const inspectorState = namespace('InspectorState');
    const gridState = namespace('GridState');

    @Component
    export default class MeterInsp extends Vue {

        @inspectorState.State
        public selectedElement!: Selection;

        @gridState.State
        public grid!: Grid;

        @gridState.State
        public meters!: Array<number>;

        @gridState.Mutation
        public updateMeterCons!: (id: number, newCons: number) => void;

        // get meter(): Meter {
        //     return this.meters[this.selectedElement.id];
        //     // return this.grid.getMeter(this.selectedElement.id);
        // }

        get consumption(): number {
            // return this.meters[this.selectedElement.id].consumption;
            return this.meters[this.selectedElement.id];
        }

        set consumption(newCons: number) {
            console.log(newCons);
            // this.meters[this.selectedElement.id] = newCons;
            // console.log(this.meters);
            // console.log(this.selectedElement.id);
           // this.meter.consumption = newCons;
           // console.log("1");
           // Vue.set(this.grid.meters, this.selectedElement.id, new Meter(this.meter.name, newCons));
            this.updateMeterCons(this.selectedElement.id, newCons);
            this.$forceUpdate();
        }
    }
</script>

<style scoped>
    input {
        width: 30%;
        margin-left: 20px;
        background-color: transparent;
    }
</style>