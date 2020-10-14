<template lang="pug">
    div
        span.title.collapseAct(v-on:click="show($event)" class="active") State
        .collapsible
            .checkbox
                label(class="switch")
                    input(type="checkbox" id="fuseStatus" v-model.boolean="isClosed")
                    span(class="slider")
            span(class="stateInfo") ({{status}})
            .confidence
                span Confidence level:
                br
                input(type="range" min="0" max="100" step="0.01" class="range" v-model.number="confLevel")
                input(type="number" min="0" max="100" step="0.01" class="number" v-model.number="confLevel")
                | %
        span.title.collapseAct(v-on:click="show($event)" class="active") Load
        .collapsible
            span(v-for="ul in uLoads()" :key="ul.id") - {{ul.value}} A [{{ul.confidence}}] <br/>
</template>

<script lang="ts">

    import {Component, Vue, Prop} from "vue-property-decorator";
    import {namespace} from "vuex-class";
    import {ULoadInfo, uLoadsData} from "@/utils/uLoadsUtils";
    import {State, ULoad} from "@/ts/grid";
    import {UpdateNumVal} from "@/store/modules/grid-state";
    import {Selection} from "@/utils/selection";
    import {open} from "@/utils/collapse-utils";

    const inspectorState = namespace('InspectorState');
    const gridState = namespace('GridState');

    @Component
    export default class FuseInsp extends Vue{
        @gridState.Mutation
        public switchFuse!: (id: string) => void;

        @gridState.Mutation
        public updateStateConf!: (data: UpdateNumVal) => void;

        @inspectorState.State
        public selectedElement!: Selection;

        @gridState.Getter
        public fuseState!: (id: string) => State;

        @gridState.Getter
        public fuseIsClosed!: (id: string) => boolean;

        @gridState.Getter
        public fuseULoads!: (id: string) => Array<ULoad>;

        @gridState.Getter
        public fuseConfLevel!: (id: string) => number;

        @Prop({required: false})
        public fuseId: string | undefined;

        get id(): string {
            return (this.fuseId !== undefined)? this.fuseId : this.selectedElement.id;
        }

        get isClosed() {
            return this.fuseIsClosed(this.id);
        }

        // eslint-disable-next-line
        set isClosed(newVal: boolean) {
            this.switchFuse(this.id);
        }

        get confLevel() {
            let roundedPerc = this.fuseConfLevel(this.id) * 100;
            roundedPerc = Math.round((roundedPerc + Number.EPSILON) * 100) / 100;
            return roundedPerc;
        }

        set confLevel(newPerc: number) {
            this.updateStateConf({id: this.id, newValue: newPerc / 100});
        }


        get status(): string {
           return this.fuseState(this.id)
        }

        public show(event: MouseEvent) {
            open(event);
        }

        public uLoads(): Array<ULoadInfo> {
            return uLoadsData(this.fuseULoads(this.id));
        }

    }
</script>

<style scoped lang="scss">
    @import "@/scss/fuseInsp.scss";
</style>