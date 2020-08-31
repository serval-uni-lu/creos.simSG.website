<template>
    <g :transform=transform :visibility=visibility class="infoBox">
        <rect x="0" y="0" rx="8" ry="8" :width=width :height="height" fill="white"  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
        <text transform="translate(5 5)" fill="black">
            <tspan font-family="Helvetica Neue" font-size="8" font-weight="700" x="26" :y=getYText(0)>Fuse {{id + 1}}</tspan>
            <tspan font-family="Helvetica Neue" font-size="8" font-weight="400" x="0" :y=getYText(1)>Status: {{status}} [{{confLevel}}%]</tspan>
            <tspan font-family="Helvetica Neue" font-size="8" font-weight="400" x="0" :y=getYText(2)>Load:</tspan>
            <tspan v-for="ul in uLoads()" :key="ul.id" font-family="Helvetica Neue" font-size="8" font-weight="400" x="0" :y="ul.y">- {{ul.value}} A [{{ul.confidence}}%]</tspan>
        </text>
    </g>
</template>

<script lang="ts">
    import {Component, Vue, Prop} from "vue-property-decorator";
    import {Point} from "@/utils/svg-types";
    import {namespace} from "vuex-class";
    import {getYText, layerHeight, uLoadsDataWithY} from "@/utils/infoLayerUtils";
    import {ULoadInfo} from "@/utils/uLoadsUtils";
    import {Fuse, Grid} from "@/ts/grid";


    const toolbarState = namespace('ToolBarState');
    const gridState = namespace('GridState');

    @Component
    export default class InfoLayerFuse extends Vue{
        @Prop() id!: number;
        @Prop() location!: Point;

        public readonly  width = 100;
        public static readonly nbTextLineInTemplate = 3;

        @toolbarState.State
        public fuseLayerVisible!: boolean;

        @gridState.State
        public grid!: Grid;

        get visibility(): string {
            return (this.fuseLayerVisible)? "visible": "hidden";
        }

        get transform(): string {
            const realX = this.location.x - (this.width/2);
            const realY = this.location.y - (this.height/2);
            return "translate(" + realX + " " + realY + ")";
        }

        get height(): number {
            return layerHeight(InfoLayerFuse.nbTextLineInTemplate, this.fuse.uloads.length);
        }


        get fuse(): Fuse {
            return this.grid.getFuse(this.id);
        }

        get status(): string {
            return this.fuse.status.state;
        }

        get confLevel(): string {
            return this.fuse.status.prettyConf;
        }

        public getYText(posElmt: number): number {
            return getYText(InfoLayerFuse.nbTextLineInTemplate, posElmt);
        }

        public uLoads(): Array<ULoadInfo> {
            const uLoads = this.fuse.uloads;
            return uLoadsDataWithY(uLoads, InfoLayerFuse.nbTextLineInTemplate);
        }



    }
</script>

<style scoped lang="scss">
@import "@/scss/infoLayer.scss";
</style>