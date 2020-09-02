<template lang="pug">
    .scrollable-div
        p Fuses:
        FuseInsp(v-for="fuse in fuses" :key="fuse" :fuseId="fuse")

</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import {namespace} from "vuex-class";
    import {Selection} from "@/utils/selection";
    import {Entity, Fuse, Grid} from "@/ts/grid";
    import FuseInsp from "@/components/inspector/FuseInsp.vue";

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

        get fuses(): Array<number> {
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

    }

</script>

<style scoped lang="scss">

</style>