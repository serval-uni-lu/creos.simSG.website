<template lang="pug">
    div
        h2 {{selectedElement.name}}
        h3(v-if="nameNotDefault") {{selectedElement.type}} - {{selectedElement.id}}
        .form
            FuseInsp(v-if="isFuse" :fuseId="selectedElement.id")
            MeterInsp(v-else-if="isMeter")
            CableInsp(v-else-if="isCable")
            EntityInsp(v-else-if="isEntity")
        .closingButton(v-on:click="reset()")
            svg
                use(xlink:href="#close-button")


</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import {namespace} from "vuex-class";
    import {ElmtType, Selection} from "@/utils/selection";
    import FuseInsp from "@/components/inspector/FuseInsp.vue";
    import MeterInsp from "@/components/inspector/MeterInsp.vue";
    import CableInsp from "@/components/inspector/CableInsp.vue";
    import EntityInsp from "@/components/inspector/EntityInsp.vue";

    const inspectorState = namespace('InspectorState');

    @Component({
        components: {EntityInsp, CableInsp, MeterInsp, FuseInsp}
    })
    export default class Inspector extends Vue{

        @inspectorState.State
        public selectedElement!: Selection;

        @inspectorState.Mutation
        public reset!: () => void;

        get isFuse(): boolean {
            return this.selectedElement.type === ElmtType.Fuse;
        }

        get isMeter(): boolean {
            return this.selectedElement.type === ElmtType.Meter;
        }

        get isCable(): boolean {
            return this.selectedElement.type === ElmtType.Cable;
        }

        get isEntity(): boolean {
            return this.selectedElement.type === ElmtType.Entity;
        }

        get nameNotDefault(): boolean {
            return this.selectedElement.name !== this.selectedElement.type + " - " + this.selectedElement.id
        }

    }
</script>

<style scoped lang="scss">
    @import "@/scss/global-var.scss";

    h2 {
        margin-bottom: 0;
    }

    h3 {
        margin-top: 0;
    }

    .form {
        font-size: $inspector-font-size;
        text-align: left;
        padding-left: 10px;
        flex: 1 1 auto;
        overflow-y: auto;
        height: 0px;
    }

    .closingButton {
        position: absolute;
        top: 5px;
        right: 5px;

        svg {
            width: 20px;
            height: 20px;
            stroke: black;
            stroke-width: 2;

            &:hover {
                stroke: lightcoral;
            }

        }
    }
</style>