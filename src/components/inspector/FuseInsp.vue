<template lang="pug">
    div(style="text-align: left")
        div
            span.title.collapseAct(v-on:click="show($event)" class="active") State
            .collapsible
                .checkbox
                    label(class="switch")
                        input(type="checkbox" id="fuseStatus" v-model.boolean="isClosed")
                        span(class="slider")
                span(class="stateInfo") ({{status()}})
                .confidence
                    span Confidence level:
                    br
                    input(type="range" min="0" max="100" step="0.01" class="range" v-model.number="confLevel")
                    input(type="number" min="0" max="100" step="0.01" class="number" v-model.number="confLevel")
                    | %
        .line
        div
            span.title.collapseAct(v-on:click="show($event)" class="active") Load
            .collapsible
                span(v-for="ul in uLoads()" :key="ul.id") - {{ul.value}} A [{{ul.confidence}}%] <br/>
</template>

<script lang="ts">

    import {Component, Vue} from "vue-property-decorator";
    import {namespace} from "vuex-class";
    import {Selection} from "@/utils/selection";
    import {ULoadInfo, uLoadsData} from "@/utils/uLoadsUtils";
    import {ConfidenceLevel, Fuse, Grid, State, ULoad} from "@/ts/grid";
    import {fuseIsClosed, getFuseState, getFuseStatusConf, UpdateNumVal} from "@/store/modules/grid-state";

    const inspectorState = namespace('InspectorState');
    const gridState = namespace('GridState');

    @Component
    export default class FuseInsp extends Vue{
        // @gridState.State
        // public grid!: Grid;

        // @gridState.Getter
        // public getFuseULoads!: (id: number) => Array<ULoad>| undefined;
        //
        // @gridState.Getter
        // public fuseIsClosed!: (id: number) => boolean;
        //
        // @gridState.Getter
        // public getFuseStatusConf!: (id: number) => number;
        //
        // @gridState.Getter
        // public getFuseState!: (id: number) => State;

        @gridState.State
        public fuseULoads!: Map<number, Array<ULoad>>;

        @gridState.State
        public fuseUStatusState!: Map<number, State>;

        @gridState.State
        public fuseUStatusConf!: Map<number, ConfidenceLevel>;

        @gridState.Mutation
        public switchFuse!: (id: number) => void;

        @gridState.Mutation
        public updateStateConf!: (data: UpdateNumVal) => void;

        @inspectorState.State
        public selectedElement!: Selection;


        // get fuse(): Fuse {
        //     return this.grid.getFuse(this.selectedElement.id);
        // }

        get isClosed() {
            // return this.fuse.isClosed();
            // return fuseIsClosed(this.fuseUStatusState, this.selectedElement.id);
            return  this.fuseUStatusState.get(this.selectedElement.id) === State.CLOSED
        }

        // eslint-disable-next-line
        set isClosed(newVal: boolean) {
            this.switchFuse(this.selectedElement.id);
        }

        get confLevel() {
            // let roundedPerc = this.fuse.status.confidence.level * 100;
            let roundedPerc = getFuseStatusConf(this.fuseUStatusConf, this.selectedElement.id) * 100;
            roundedPerc = Math.round((roundedPerc + Number.EPSILON) * 100) / 100;
            return roundedPerc;
        }

        set confLevel(newPerc: number) {
            this.updateStateConf({id: this.selectedElement.id, newValue: newPerc / 100});
            // this.fuse.status.confidence.level = newPerc / 100;
        }


        public status(): string {
            // return this.fuse.status.state;
            // return getFuseState(this.fuseUStatusState, this.selectedElement.id);
            return this.fuseUStatusState.get(this.selectedElement.id) as State;
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
            return uLoadsData(this.fuseULoads.get(this.selectedElement.id));
        }

    }
</script>

<style scoped lang="scss">
    @import "@/scss/global-var.scss";

    .range,
    .number {
        background-color: transparent;
    }

    .collapseAct {
        width: 100%;
    }

    .collapseAct.active::before {
        content: "\25BE"; /* Unicode character for down arrow sign (▾) */
    }

    .collapseAct::before {
        content: "\25B8"; /* Unicode character for right arrow sign (▸) */
        padding-right: 10px;
        color: $text-color;
    }

    .collapsible {
        overflow: hidden;
        max-height: max-content;
        transition: max-height 0.2s ease-out;
    }

    .title {
        font-weight: bold;
        margin: auto;
        display: block;
    }

    .line {
        width: 95%;
        margin: 10px auto;
        height: 2px;
        background-color: grey;
        display: block;
    }
    .confidence {
        .range {
            width: 60%;
            margin-right: 5%;
            position: relative;
            top: 5px;
        }

        //FF only
        .range[type="range"]::-moz-range-progress {
            background-color: $link-color;
        }
        .range[type="range"]::-moz-range-track {
            background-color: grey;
        }

        .number {
            max-width: 65px;
        }
    }

    .stateInfo {
        display: inline;
        position: relative;
        left: 40px;
        font-size: 0.9em;
        font-style: italic;
    }

    .checkbox {
        display: inline;
        position: relative;
        top: 6px;
        left: 10px;
    }

    .switch {
        position: relative;
        display: inline-block;
        width: 30px;
        height: 16px;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: blue;
        opacity: 10%;
        -webkit-transition: .4s;
        transition: .4s;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 12px;
        width: 12px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        -webkit-transition: .4s;
        transition: .4s;
    }

    input:checked + .slider {
        background-color: $link-color;
        opacity: 100%;
    }

    input:focus + .slider {
        left: 50px;
        box-shadow: 0 0 1px $link-color;
    }

    input:checked + .slider:before {
        -webkit-transform: translateX(14px);
        -ms-transform: translateX(14px);
        transform: translateX(14px);
    }

</style>