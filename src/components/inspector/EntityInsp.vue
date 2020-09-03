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

</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import {namespace} from "vuex-class";
    import {Selection} from "@/utils/selection";
    import {Entity, Fuse, Grid, State, ULoad} from "@/ts/grid";
    import FuseInsp from "@/components/inspector/FuseInsp.vue";
    import {UpdateNumVal} from "@/store/modules/grid-state";
    import {ULoadInfo, uLoadsData} from "@/utils/uLoadsUtils";

    const inspectorState = namespace('InspectorState');
    const gridState = namespace('GridState');

    interface FuseData {
        id: number;
    }

    @Component({
        components: {FuseInsp}
    })
    export default class EntityInsp extends Vue {

        @inspectorState.State
        public selectedElement!: Selection;

        @gridState.State
        public grid!: Grid;

        @gridState.Getter
        public fuseIsClosed!: (id: number) => boolean;

        @gridState.Getter
        public fuseState!: (id: number) => State;

        @gridState.Getter
        public fuseConfLevel!: (id: number) => number;

        @gridState.Getter
        public fuseULoads!: (id: number) => Array<ULoad>;

        @gridState.Mutation
        public switchFuse!: (id: number) => void;

        @gridState.Mutation
        public updateStateConf!: (data: UpdateNumVal) => void;

        public checked(id: number): string {
            return (this.fuseIsClosed(id))? "checked" : "";
        }


        get fusesId(): Array<number> {
            const ent: Entity|undefined = this.grid.entities?.get(this.selectedElement.id);
            if(ent !== undefined) {
                const ids = new Array<number>();
                ent.fuses.forEach((fuse: Fuse) => {
                   ids.push(fuse.id);
                });
                return ids;
            }
            return [-1];
        }

        public getConfLevel(id: number) {
            let roundedPerc = this.fuseConfLevel(id) * 100;
            roundedPerc = Math.round((roundedPerc + Number.EPSILON) * 100) / 100;
            return roundedPerc;
        }


        public updateConf(id: number, newValue: number) {
            this.updateStateConf({id: id, newValue: newValue / 100});
        }

        public uLoads(id: number): Array<ULoadInfo> {
            return uLoadsData(this.fuseULoads(id));
            // return uLoadsData(this.fuseULoads(this.fuseId));
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

    h4 {
        margin-top: 0;
        margin-bottom: 0;
    }

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