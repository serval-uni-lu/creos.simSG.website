import {ElmtType} from "@/utils/selection";
<template lang="pug">
    section
        h2 Real-case scenario: Reckange disctrict (Mersch, Luxembourg)

        .toolbar
            img.cblFuseLayer(src="@/assets/buttons/infoLayerCable.svg" title="Add a layer with cables information" class="btn btn-secondary" v-bind:class="{active: showCableLayer}" v-on:click="showOrHideCableLayer()")

        #viewer
            Action#action
            #lg-map
            Inspector#inspector(v-if="inspVisible")
</template>

<script lang="ts">
import {Component, Vue, Watch} from "vue-property-decorator";
import Action from "@/components/Action.vue";
import Inspector from "@/components/inspector/Inspector.vue";
import {namespace} from "vuex-class";
import {ElmtType, NullSelection, Selection} from "@/utils/selection";
import L, {LatLngExpression, LatLngLiteral} from "leaflet";
import {Cable, Entity, Grid, Meter, ULoad} from "@/ts/grid";
import {GridJson} from "@/types/sg-json.types";
import json from "@/assets/grids/real-case.json";
import {
  extractParaCables,
  meterCableStyle,
  setDefaultStyle,
  setHoverStyle,
  setSelectedStyle
} from "@/utils/sg-icon-utils";
import {CableLine, CableMarker, EntityMarker, MeterMarker} from "@/types/sg-markers-types";
import ToolBar from "@/components/scView/scviewer/ToolBar.vue";
import {uLoadsData} from "@/utils/uLoadsUtils";

const inspectorState = namespace('InspectorState');
    const gridState = namespace("GridState");

    @Component({
        components: {ToolBar, Inspector, Action}
    })
    export default class LuxSG extends Vue{
        @inspectorState.State
        public selectedElement!: Selection;

        @inspectorState.Mutation
        public select!: (elmt: Selection) => void;

        @gridState.State
        public grid!: Grid;

        @gridState.Mutation
        public initFromJson!: (json: GridJson) => void;

        @gridState.Getter
        public cableULoads!: (id: string) => Array<ULoad>|undefined;

        public showCableLayer = false;
        public cableLayer = new Array<CableMarker>();
        private map!: L.Map;

        get inspVisible(): boolean {
            return !this.selectedElement.equals(NullSelection);
        }

        private selection: EntityMarker | CableLine | MeterMarker | undefined;
        private hover: EntityMarker | CableLine | MeterMarker | undefined;

        public showOrHideCableLayer() {
            this.showCableLayer = !this.showCableLayer;
            if(!this.showCableLayer) {
                this.cableLayer.forEach((cbl: L.Marker) => cbl.remove())
            } else {
                this.cableLayer.forEach((cbl: CableMarker) => {
                    cbl.setIcon(this.createCableLayer(cbl.cableId))
                    cbl.addTo(this.map)
                })
            }
        }

        public cableUloadStr(cableId: string): string {
            const data = uLoadsData(this.cableULoads(cableId));
            let str = "";
            for(const d of data) {
                str += "<li>" + d.value + " A [" + d.confidence + "%]</li>"
            }
            return str;
        }

        private createCableLayer(cableId: string): L.DivIcon {
            return new L.DivIcon({
                html:  "<div class='cableInfo'>" +
                    "    <h4>Cable " + cableId + "</h4>" +
                    "    <ul>" +
                        this.cableUloadStr(cableId) +
                    "    </ul>" +
                    "</div>",
                className: ""
            });
        }

        public created() {
            this.initFromJson(json as GridJson);
        }


        @Watch("selectedElement")
        public inspClosed() {
            if(this.selectedElement.equals(NullSelection)) {
                if(this.selection !== undefined) {
                    setDefaultStyle(this.selection);
                    this.selection = undefined;
                }
            }
        }

        private selectMarker(newSelect: CableLine | EntityMarker | MeterMarker) {
            if(this.selection !== undefined) {
                setDefaultStyle(this.selection);
            }
            this.selection = newSelect;
            setSelectedStyle(this.selection);
        }

        private startHover(newMarker: EntityMarker | CableLine | MeterMarker) {
            if(this.selection === undefined || newMarker !== this.selection) {
                if(this.hover !== undefined) {
                    setDefaultStyle(this.hover);
                }
                this.hover = newMarker;
                setHoverStyle(this.hover);
            }
        }

        private quitHover() {
            if(this.hover != undefined && this.hover !== this.selection) {
                setDefaultStyle(this.hover);
            }
            this.hover = undefined;
        }

        private drawCable(paraC: Array<Cable>, cableDone: Set<string>, map: L.Map) {
            // Here the algo. does not keep same distance between cables
            // but the result is sufficient enough for the demo
            paraC.forEach((cable: Cable, idx: number) => {
                if(!cableDone.has(cable.id)) {
                    cableDone.add(cable.id);

                    let geoLine: LatLngLiteral[];
                    if(paraC.length == 1) {
                        geoLine = [
                            {lat: cable.fuse1.latitude as number, lng: cable.fuse1.longitude as number},
                            {lat: cable.fuse2.latitude as number, lng: cable.fuse2.longitude as number},
                        ];
                    } else {
                        let offset: number;
                        if (idx % 2 === 0) {
                            offset = (idx / 2 + 1);
                        } else {
                            offset = -((idx + 1) / 2);
                        }

                        offset = offset * 0.00005;

                        geoLine = [
                            {
                                lat: (cable.fuse1.latitude as number),
                                lng: (cable.fuse1.longitude as number) + offset
                            },
                            {
                                lat: (cable.fuse2.latitude as number),
                                lng: (cable.fuse2.longitude as number) + offset
                            }
                        ];
                    }

                    const cableLine = new CableLine(geoLine, cable);
                    setDefaultStyle(cableLine);
                    cableLine.addTo(map);
                    cableLine.bindTooltip(cable.name);
                    cableLine.on('click', (event: L.LeafletMouseEvent) => {
                        const c = event.target as CableLine;
                        this.selectMarker(c);
                        this.select(new Selection(c.cable.id, ElmtType.Cable))
                    });

                    cableLine.on("mouseover", (event: L.LeafletMouseEvent) => {
                        this.startHover(event.target as CableLine);
                    });

                    cableLine.on("mouseout", () => {
                        this.quitHover();
                    });


                    const pos: LatLngExpression = {
                        lat: (geoLine[0].lat + geoLine[1].lat) / 2,
                        lng: (geoLine[0].lng + geoLine[1].lng) / 2
                    };
                    const infoA = new CableMarker(pos, cable.id, {draggable: true});
                    this.cableLayer.push(infoA);

                    cable.meters.forEach((meter: Meter) => {
                      const markerPos: LatLngExpression = {lat: meter.latitude, lng: meter.longitude};
                      const marker = new MeterMarker(markerPos, meter);
                      setDefaultStyle(marker);
                      marker.addTo(map);

                      marker.on("mouseover", (event: L.LeafletMouseEvent) => this.startHover(event.target as MeterMarker));
                      marker.on("mouseout", () => this.quitHover());
                      marker.bindTooltip(meter.name);
                      marker.on("click", (event: L.LeafletMouseEvent) => {
                        const marker = event.target as MeterMarker;
                        this.selectMarker(marker);
                        this.select(new Selection(marker.meter.id, ElmtType.Meter, marker.meter.name))
                      });

                      const cableConn = new L.Polyline([pos, markerPos]);
                      cableConn.addTo(map);
                      cableConn.setStyle(meterCableStyle);

                    });

                }
            })
        }

        private drawEntity(entity: Entity, cableDone: Set<string>, map: L.Map) {
            if(entity.latitude !== undefined && entity.longitude !== undefined) {
                const marker = new EntityMarker([entity.latitude, entity.longitude], entity);
                setDefaultStyle(marker);
                marker.addTo(map);
                marker.on("click", (event: L.LeafletMouseEvent) => {
                    const marker = event.target as EntityMarker;
                    this.selectMarker(marker);
                    this.select(new Selection(marker.entity.id, ElmtType.Entity, marker.entity.name));
                });
                marker.on("mouseover", (event: L.LeafletMouseEvent) => {
                    this.startHover(event.target as EntityMarker);
                });
                marker.on("mouseout", () => {
                    this.quitHover();
                });
                marker.bindTooltip(entity.name + " (" + entity.type + ")");


                const paraCables = extractParaCables(entity);
                paraCables.forEach((paraC: Array<Cable>) => {
                    this.drawCable(paraC, cableDone, map)
                });

            }
        }

        public mounted() {
            this.map = L.map("lg-map", {
                center: [49.749219791749525, 6.08051569442007],
                zoom: 16,
                zoomControl: false
            });

            const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            });
            tileLayer.addTo(this.map);

            const cableDone = new Set<string>();
            this.grid.entities?.forEach((entity: Entity) => {
                this.drawEntity(entity, cableDone, this.map)
            });

        }

    }
</script>

<style scoped lang="scss">
    @import "@/scss/viewer.scss";
    $remaining: calc(100% - (#{$margin} + #{$size-side-elmt}) * 2 - (#{$margin} * 2));

    .btn-secondary, .btn-secondary, .btn-primary:visited {
        background-color: lightgray !important;
        border-color: lightgray !important;
    }

    .btn-secondary.active, .btn-secondary:hover {
        background-color: gray !important;
        border-color: gray !important;
    }

    #lg-map {
        width: $remaining;
        margin-bottom: $margin-bottom;
        margin-left: $margin;
        margin-right: $margin;
    }

    .toolbar {
        margin-bottom: 10px;
    }

    .cblFuseLayer {
        margin-left: 3px;
        margin-right: 3px;
        width:  40px;
        height: 40px;
        padding: 3px;
    }
</style>

<style lang="scss">
    .cableInfo {
        background-color: white;
        width: max-content;
        border: #6F2683 2px solid;
        border-radius: 16px;
        color: #6F2683;
        padding-left: 10px;
        padding-right: 10px;
        h4 {
            font-weight: bold;
            font-size: 16px;
            margin-top: 0;
            margin-bottom: 0;
        }

        ul {
            margin-top: 0;
            padding-left: 0;
            text-align: left;
            list-style: none;
        }

        li:before {
            content: "-";
            padding-right: 5px;
        }
    }
</style>