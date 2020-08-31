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
    import {UpdateConsData} from "@/store/modules/grid-state";

    const inspectorState = namespace('InspectorState');
    const gridState = namespace('GridState');

    @Component
    export default class MeterInsp extends Vue {

        @inspectorState.State
        public selectedElement!: Selection;

        @gridState.State
        public grid!: Grid;

        @gridState.Mutation
        public updateMeterCons!: (data: UpdateConsData) => void;

        get consumption(): number {
            return this.grid.getMeter(this.selectedElement.id).consumption;
        }

        set consumption(newCons: number) {
            this.updateMeterCons({id: this.selectedElement.id, newCons: newCons});
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