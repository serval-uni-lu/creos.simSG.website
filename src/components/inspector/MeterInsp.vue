<template lang="pug">
    div
        | {{text}}:
        input(type="number", min="0", step="0.01", v-model.number="consumption")
</template>

<script lang="ts">

import {Component, Prop, Vue} from "vue-property-decorator";
    import {namespace} from "vuex-class";
    import {Selection} from "@/utils/selection";
    import {UpdateNumVal} from "@/store/modules/grid-state";

    const inspectorState = namespace('InspectorState');
    const gridState = namespace('GridState');

    @Component
    export default class MeterInsp extends Vue {
        @Prop({required: false})
        public meterId: string | undefined;

        @inspectorState.State
        public selectedElement!: Selection;

        @gridState.Getter
        public meterCons!: (id: string) => number;

        @gridState.Getter
        public meterName!: (id: string) => string;

        @gridState.Mutation
        public updateConsumption!: (data: UpdateNumVal) => void;

        get id(): string {
          return (this.meterId === undefined)? this.selectedElement.id : this.meterId;
        }

        get text(): string {
          return (this.meterId === undefined)? "Consumption" : this.meterName(this.meterId);
        }

        get consumption(): number {
            return this.meterCons(this.id);
        }

        set consumption(newCons: number) {
            this.updateConsumption({id: this.id, newValue: newCons});
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