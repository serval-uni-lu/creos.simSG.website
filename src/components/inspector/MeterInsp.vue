<template lang="pug">
    div
        | Consumption:
        input(type="number", min="0", step="0.01", v-model.number="consumption")
</template>

<script lang="ts">

    import {Component, Vue} from "vue-property-decorator";
    import {namespace} from "vuex-class";
    import {Selection} from "@/utils/selection";
    import {UpdateNumVal} from "@/store/modules/grid-state";

    const inspectorState = namespace('InspectorState');
    const gridState = namespace('GridState');

    @Component
    export default class MeterInsp extends Vue {

        @inspectorState.State
        public selectedElement!: Selection;

        @gridState.Getter
        public meterCons!: (id: number) => number;

        @gridState.Mutation
        public updateConsumption!: (data: UpdateNumVal) => void;

        get consumption(): number {
            return this.meterCons(this.selectedElement.id as number);
        }

        set consumption(newCons: number) {
            this.updateConsumption({id: this.selectedElement.id as number, newValue: newCons});
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