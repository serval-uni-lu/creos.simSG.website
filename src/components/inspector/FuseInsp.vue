<template lang="pug">
    div(style="text-align: left")
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
        div
            span.title.collapseAct(v-on:click="show($event)" class="active") Load
            .collapsible
                span(v-for="ul in uLoads()" :key="ul.id") - {{ul.value}} A [{{ul.confidence}}%] <br/>
</template>

<script lang="ts">

    import {Component, Vue} from "vue-property-decorator";
    import {namespace} from "vuex-class";
    import {ULoadInfo, uLoadsData} from "@/utils/uLoadsUtils";
    import {State, ULoad} from "@/ts/grid";
    import {UpdateNumVal} from "@/store/modules/grid-state";
    import {Selection} from "@/utils/selection";

    const inspectorState = namespace('InspectorState');
    const gridState = namespace('GridState');

    @Component
    export default class FuseInsp extends Vue{
        @gridState.Mutation
        public switchFuse!: (id: number) => void;

        @gridState.Mutation
        public updateStateConf!: (data: UpdateNumVal) => void;

        @inspectorState.State
        public selectedElement!: Selection;

        @gridState.Getter
        public fuseState!: (id: number) => State;

        @gridState.Getter
        public fuseIsClosed!: (id: number) => boolean;

        @gridState.Getter
        public fuseULoads!: (id: number) => Array<ULoad>;

        @gridState.Getter
        public fuseConfLevel!: (id: number) => number;

        get isClosed() {
            return this.fuseIsClosed(this.selectedElement.id);
            // return this.fuseIsClosed(this.fuseId);
        }

        // eslint-disable-next-line
        set isClosed(newVal: boolean) {
            this.switchFuse(this.selectedElement.id);
            // this.switchFuse(this.fuseId);
        }

        get confLevel() {
            let roundedPerc = this.fuseConfLevel(this.selectedElement.id) * 100;
            // let roundedPerc = this.fuseConfLevel(this.fuseId) * 100;
            roundedPerc = Math.round((roundedPerc + Number.EPSILON) * 100) / 100;
            return roundedPerc;
        }

        set confLevel(newPerc: number) {
            this.updateStateConf({id: this.selectedElement.id, newValue: newPerc / 100});
            // this.updateStateConf({id: this.fuseId, newValue: newPerc / 100});
        }


        get status(): string {
           return this.fuseState(this.selectedElement.id)
           // return this.fuseState(this.fuseId)
        }

        public show(event: MouseEvent) {
            const source = event.target as HTMLElement;
            source.classList.toggle("active");
            const content = source.nextElementSibling as HTMLElement;

            if (content.style.maxHeight !== "0px") {
                content.style.maxHeight = "0px";
            } else {
                content.style.maxHeight =  content.scrollHeight + "px";
            }
        }

        public uLoads(): Array<ULoadInfo> {
            return uLoadsData(this.fuseULoads(this.selectedElement.id));
            // return uLoadsData(this.fuseULoads(this.fuseId));
        }

    }
</script>

<style scoped lang="scss">
    @import "@/scss/fuseInsp.scss";
</style>