<template lang="pug">
    div
        h4.collapseAct(v-on:click="show($event)" class="active") Fuses
        .collapsible
            #fuseInfo(v-for="fuseId in fusesId" :key="fuseId")
                div
                    span.title.collapseAct(v-on:click="show($event)" class="active") Fuse {{fuseId}}
                    .collapsible
                        span.title.collapseAct(v-on:click="show($event)" class="active") State
                        .collapsible
                            .checkbox
                                label(class="switch")
                                    input(type="checkbox" id="fuseStatus" :checked="checked(fuseId)" v-on:input="switchFuse(fuseId)")
                                    span(class="slider")
                            span(class="stateInfo") ({{fuseState(fuseId)}})
                            .confidence
                                span Confidence level:
                                br
                                input(type="range" min="0" max="100" step="0.01" class="range" v-bind:value="getConfLevel(fuseId)" v-on:input="updateConf(fuseId, $event.target.value)")
                                input(type="number" min="0" max="100" step="0.01" class="number" v-bind:value="getConfLevel(fuseId)")
                                | %
                        span.title.collapseAct(v-on:click="show($event)" class="active") Load
                        .collapsible
                            span(v-for="ul in uLoads(fuseId)" :key="ul.id") - {{ul.value}} A [{{ul.confidence}}%] <br/>
                .line
        | Load:
        div
            span(v-for="ul in getCableULoads()" :key="ul.id")  - {{ul.value}} A [{{ul.confidence}} %] <br/>
</template>

<script lang="ts">

    import {Component, Vue} from "vue-property-decorator";
    import {namespace} from "vuex-class";
    import {ULoadInfo, uLoadsData} from "@/utils/uLoadsUtils";
    import {Selection} from "@/utils/selection";
    import {Cable, Grid, State, ULoad} from "@/ts/grid";
    import {UpdateNumVal} from "@/store/modules/grid-state";

    const inspectorState = namespace('InspectorState');
    const gridState = namespace('GridState');

    @Component
    export default class CableInsp extends Vue {

        @inspectorState.State
        public selectedElement!: Selection;

        @gridState.Getter
        public cableULoads!: (id: number) => Array<ULoad>;

        @gridState.State
        public grid!: Grid;

        @gridState.Getter
        public fuseIsClosed!: (id: number) => boolean;

        @gridState.Mutation
        public switchFuse!: (id: number) => void;

        @gridState.Getter
        public fuseState!: (id: number) => State;

        @gridState.Getter
        public fuseConfLevel!: (id: number) => number;

        @gridState.Mutation
        public updateStateConf!: (data: UpdateNumVal) => void;

        @gridState.Getter
        public fuseULoads!: (id: number) => Array<ULoad>;

        public getConfLevel(id: number) {
            let roundedPerc = this.fuseConfLevel(id) * 100;
            roundedPerc = Math.round((roundedPerc + Number.EPSILON) * 100) / 100;
            return roundedPerc;
        }

        public updateConf(id: number, newValue: number) {
            this.updateStateConf({id: id, newValue: newValue / 100});
        }

        public getCableULoads(): Array<ULoadInfo> {
            return uLoadsData(this.cableULoads(this.selectedElement.id));
        }

        get fusesId(): Array<number> {
            const cable = this.grid.cables.get(this.selectedElement.id) as Cable;
            return [cable.fuse1.id, cable.fuse2.id]
        }

        public checked(id: number): string {
            return (this.fuseIsClosed(id))? "checked" : "";
        }

        public uLoads(id: number): Array<ULoadInfo> {
            return uLoadsData(this.fuseULoads(id));
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


    }
</script>

<style scoped lang="scss">
    @import "@/scss/fuseInsp.scss";

    #fuseInfo {
        text-align: left;
    }

    .line {
        width: 95%;
        margin: 10px auto;
        height: 2px;
        background-color: grey;
        display: block;
    }
</style>