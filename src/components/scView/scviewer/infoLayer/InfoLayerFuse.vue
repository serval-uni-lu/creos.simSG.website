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
    import {ConfidenceLevel, Fuse, Grid, State, ULoad} from "@/ts/grid";
    import {getFuseState, getFuseStatusConfStr} from "@/store/modules/grid-state";


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

        // @gridState.State
        // public grid!: Grid;

        // @gridState.Getter
        // public getFuseState!: (id: number) => State;
        //
        // @gridState.Getter
        // public getFuseStatusConfStr!: (id: number) => string;
        //
        // @gridState.Getter
        // public getFuseULoad!: (id: number) => Array<ULoad>| undefined;

        @gridState.State
        public fuseULoads!: Map<number, Array<ULoad>>;

        @gridState.State
        public fuseUStatusState!: Map<number, State>;

        @gridState.State
        public fuseUStatusConf!: Map<number, ConfidenceLevel>;

        get visibility(): string {
            return (this.fuseLayerVisible)? "visible": "hidden";
        }

        get transform(): string {
            const realX = this.location.x - (this.width/2);
            const realY = this.location.y - (this.height/2);
            return "translate(" + realX + " " + realY + ")";
        }

        get height(): number {
            const uloads: Array<ULoad>| undefined = this.fuseULoads.get(this.id);
            const length = (uloads === undefined)? 1 : uloads.length;
            return layerHeight(InfoLayerFuse.nbTextLineInTemplate, length);
        }


        // get fuse(): Fuse {
        //     return this.grid.getFuse(this.id);
        // }

        get status(): string {
            return getFuseState(this.fuseUStatusState, this.id);
            // return this.fuse.status.state;
        }

        get confLevel(): string {
            // return this.fuse.status.prettyConf;
            return getFuseStatusConfStr(this.fuseUStatusConf, this.id);
        }

        public getYText(posElmt: number): number {
            return getYText(InfoLayerFuse.nbTextLineInTemplate, posElmt);
        }

        public uLoads(): Array<ULoadInfo> {
            const uLoads = this.fuseULoads.get(this.id);
            return uLoadsDataWithY(uLoads, InfoLayerFuse.nbTextLineInTemplate);
        }



    }
</script>

<style scoped lang="scss">
@import "@/scss/infoLayer.scss";
</style>