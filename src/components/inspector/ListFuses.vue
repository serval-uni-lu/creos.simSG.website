<template lang="pug">
    div
        h4.collapseAct(v-on:click="show($event)" class="active") Fuses
        .collapsible
            #fuseInfo(v-for="fuseId in fusesId" :key="fuseId")
                span.title.collapseAct(v-on:click="show($event)" class="active") Fuse {{fuseId}}
                .collapsible
                    FuseInsp(:fuseId="fuseId")
                .line
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import {open} from "@/utils/collapse-utils";
    import {namespace} from "vuex-class";
    import {ElmtType, Selection} from "@/utils/selection";
    import {Cable, Entity, Fuse, Grid} from "@/ts/grid";
    import FuseInsp from "@/components/inspector/FuseInsp.vue";

    const inspectorState = namespace('InspectorState');
    const gridState = namespace('GridState');

    @Component({components: {FuseInsp}})
    export default class ListFuses extends Vue{
        @inspectorState.State
        public selectedElement!: Selection;

        @gridState.State
        public grid!: Grid;

        get fusesId(): Array<number> {
            if(this.selectedElement.type === ElmtType.Entity) {
                const ent: Entity|undefined = this.grid.entities?.get(this.selectedElement.id);
                if(ent !== undefined) {
                    const ids = new Array<number>();
                    ent.fuses.forEach((fuse: Fuse) => {
                        ids.push(fuse.id);
                    });
                    return ids;
                }
                return [-1];
            } else {
                const cable = this.grid.cables.get(this.selectedElement.id) as Cable;
                return [cable.fuse1.id, cable.fuse2.id]
            }
        }

        public show(event: MouseEvent) {
            open(event);
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