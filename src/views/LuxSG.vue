import {ElmtType} from "@/utils/selection";
<template lang="pug">
    section
        h2 Real-case scenario: Reckange disctrict (Mersch, Luxembourg)

        div#viewer
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
    import L, {LatLngLiteral} from "leaflet";
    import {Cable, Entity, Grid} from "@/ts/grid";
    import {GridJson} from "@/types/sg-json.types";
    import json from "@/assets/grids/real-case.json";
    import {extractParaCables, setDefaultStyle, setHoverStyle, setSelectedStyle} from "@/utils/sg-icon-utils";
    import {CableLine, EntityMarker} from "@/types/sg-markers-types";

    const inspectorState = namespace('InspectorState');
    const gridState = namespace("GridState");

    @Component({
        components: {Inspector, Action}
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

        get inspVisible(): boolean {
            return !this.selectedElement.equals(NullSelection);
        }

        private selection: EntityMarker | CableLine | undefined;
        private hover: EntityMarker | CableLine | undefined;


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

        private selectMarker(newSelect: CableLine | EntityMarker) {
            if(this.selection !== undefined) {
                setDefaultStyle(this.selection);
            }
            this.selection = newSelect;
            setSelectedStyle(this.selection);
        }

        private startHover(newMarker: EntityMarker | CableLine) {
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

        private drawCable(paraC: Array<Cable>, cableDone: Set<number>, map: L.Map) {
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

                }
            })
        }

        private drawEntity(entity: Entity, cableDone: Set<number>, map: L.Map) {
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
            const map = L.map("lg-map", {
                center: [49.749219791749525, 6.08051569442007],
                zoom: 16,
                zoomControl: false
            });

            const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            });
            tileLayer.addTo(map);

            const cableDone = new Set<number>();
            this.grid.entities?.forEach((entity: Entity) => {
                this.drawEntity(entity, cableDone, map)
            });
        }

    }
</script>

<style scoped lang="scss">
    @import "@/scss/viewer.scss";
    $remaining: calc(100% - (#{$margin} + #{$size-side-elmt}) * 2 - (#{$margin} * 2));

    #lg-map {
        width: $remaining;
        margin-bottom: $margin-bottom;
        margin-left: $margin;
        margin-right: $margin;
    }
</style>