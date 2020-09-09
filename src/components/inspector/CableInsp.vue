<template lang="pug">
    div
        ListFuses
        h4.collapseAct(v-on:click="show($event)" class="active") ULoads
        .collapsible
            span(v-for="ul in getCableULoads()" :key="ul.id")  - {{ul.value}} A [{{ul.confidence}} %] <br/>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import {namespace} from "vuex-class";
    import {ULoadInfo, uLoadsData} from "@/utils/uLoadsUtils";
    import {Selection} from "@/utils/selection";
    import {Cable, Grid, ULoad} from "@/ts/grid";
    import FuseInsp from "@/components/inspector/FuseInsp.vue";
    import {open} from "@/utils/collapse-utils";
    import ListFuses from "@/components/inspector/ListFuses.vue";

    const inspectorState = namespace('InspectorState');
    const gridState = namespace('GridState');
    @Component({
        components: {ListFuses, FuseInsp}
    })
    export default class CableInsp extends Vue {

        @inspectorState.State
        public selectedElement!: Selection;

        @gridState.Getter
        public cableULoads!: (id: number) => Array<ULoad>;

        @gridState.State
        public grid!: Grid;


        public getCableULoads(): Array<ULoadInfo> {
            return uLoadsData(this.cableULoads(this.selectedElement.id));
        }

        get fusesId(): Array<number> {
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