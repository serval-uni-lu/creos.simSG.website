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
    import L, {LatLngExpression, LatLngLiteral, PathOptions, PolylineOptions} from "leaflet";
    import {Cable, Entity, EntityType, Fuse, Grid} from "@/ts/grid";
    import {GridJson} from "@/types/sg-json.types";
    import json from "@/assets/grids/real-case.json";

    const inspectorState = namespace('InspectorState');
    const gridState = namespace("GridState");

    const logoSize = 35;
    const logoSizeSelected = 50;
    const iconSubs = L.icon({
        iconUrl: require("@/assets/logos/grids/substation.svg"),
        iconSize: [logoSize, logoSize]
    });

    const iconSubsHover = L.icon({
        iconUrl: require("@/assets/logos/grids/substation.svg"),
        iconSize: [logoSizeSelected, logoSizeSelected]
    });

    const iconCabinet = L.icon({
        iconUrl: require("@/assets/logos/grids/cabinet.svg"),
        iconSize: [logoSize, logoSize]
    });

    const iconCabinetHover = L.icon({
        iconUrl: require("@/assets/logos/grids/cabinet.svg"),
        iconSize: [logoSizeSelected, logoSizeSelected]
    });

    const iconSubsSelected = L.icon({
        iconUrl: require("@/assets/logos/grids/substation-selected.svg"),
        iconSize: [logoSizeSelected, logoSizeSelected]
    });

    const iconCabinetSelected = L.icon({
        iconUrl: require("@/assets/logos/grids/cabinet-selected.svg"),
        iconSize: [logoSizeSelected, logoSizeSelected]
    });

    const cableStyle: PathOptions = {
        color: "black",
        weight: 3
    };

    const cableHoverStyle: PathOptions = {
        color: "black",
        weight: 5
    };

    const cableSelectedStyle: PathOptions = {
        color: "#6F2683",
        weight: 5
    };



    class EntityMarker extends L.Marker {
       entity: Entity;

        constructor(latLng: L.LatLngExpression, entity: Entity, options?: L.MarkerOptions) {
            super(latLng, options);
            this.entity = entity;
        }

    }

    class CableLine extends L.Polyline {
        cable: Cable;

        constructor(latlngs: LatLngExpression[] | LatLngExpression[][], cable: Cable, options?: PolylineOptions) {
            super(latlngs, options);
            this.cable = cable;
        }
    }


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

        private selectedMarker: EntityMarker | undefined;
        private hoverMarker: EntityMarker | undefined;

        private selectedCable: CableLine | undefined;
        private hoverCable: CableLine | undefined;

        public created() {
            this.initFromJson(json as GridJson);
        }


        @Watch("selectedElement")
        public inspClosed() {
            if(this.selectedElement.equals(NullSelection)) {
                if(this.selectedMarker !== undefined) {
                    const newIcon = (this.selectedMarker.entity.type === EntityType.SUBSTATION) ? iconSubs : iconCabinet;
                    this.selectedMarker.setIcon(newIcon);
                    this.selectedMarker = undefined;
                }

                if(this.selectedCable !== undefined) {
                    this.selectedCable.setStyle(cableStyle);
                    this.selectedCable = undefined;
                }
            }
        }



        private selectCable(cable: CableLine) {
            if(this.selectedCable !== undefined) {
                this.selectedCable.setStyle(cableStyle);
            }
            this.selectedCable = cable;
            this.selectedCable.setStyle(cableSelectedStyle);

            if(this.selectedMarker !== undefined) {
                const newIcon = (this.selectedMarker.entity.type === EntityType.SUBSTATION) ? iconSubs : iconCabinet;
                this.selectedMarker.setIcon(newIcon);
                this.selectedMarker = undefined;
            }
        }

        private selectIcon(newMarker: EntityMarker) {
            if(this.selectedMarker !== undefined) {
                const newIcon = (this.selectedMarker.entity.type === EntityType.SUBSTATION)? iconSubs : iconCabinet;
                this.selectedMarker.setIcon(newIcon);
            }
            this.selectedMarker = newMarker;
            const newIcon = (newMarker.entity.type === EntityType.SUBSTATION)? iconSubsSelected : iconCabinetSelected;
            this.selectedMarker.setIcon(newIcon);

            if(this.selectedCable !== undefined) {
                this.selectedCable.setStyle(cableStyle);
                this.selectedCable = undefined;
            }
        }

        private quitHover() {
            if (this.hoverMarker !== undefined && this.hoverMarker.entity !== this.selectedMarker?.entity) {
                const newIcon = (this.hoverMarker.entity.type === EntityType.SUBSTATION) ? iconSubs : iconCabinet;
                this.hoverMarker.setIcon(newIcon);
            }
            this.hoverMarker = undefined;
        }

        private quitHoverCable() {
            if (this.hoverCable !== undefined && this.hoverCable.cable !== this.selectedCable?.cable) {
                this.hoverCable.setStyle(cableStyle);
            }
            this.hoverCable = undefined;
        }

        private onHoverIcon(newMarker: EntityMarker) {
            if(this.selectedMarker !== undefined) {
                if(newMarker.entity !== this.selectedMarker.entity) {
                    if (this.hoverMarker !== undefined) {
                        const newIcon = (this.hoverMarker.entity.type === EntityType.SUBSTATION) ? iconSubs : iconCabinet;
                        this.hoverMarker.setIcon(newIcon);
                    }
                    this.hoverMarker = newMarker;
                    const newIcon = (newMarker.entity.type === EntityType.SUBSTATION) ? iconSubsHover : iconCabinetHover;
                    this.hoverMarker.setIcon(newIcon);
                }
            } else {
                if (this.hoverMarker !== undefined) {
                    const newIcon = (this.hoverMarker.entity.type === EntityType.SUBSTATION) ? iconSubs : iconCabinet;
                    this.hoverMarker.setIcon(newIcon);
                }
                this.hoverMarker = newMarker;
                const newIcon = (newMarker.entity.type === EntityType.SUBSTATION) ? iconSubsHover : iconCabinetHover;
                this.hoverMarker.setIcon(newIcon);
            }

        }

        private onHoverCable(cable: CableLine) {
            if(this.selectedCable !== undefined) {
                if(cable.cable !== this.selectedCable.cable) {
                    if(this.hoverCable !== undefined) {
                        this.hoverCable.setStyle(cableStyle);
                    }
                    this.hoverCable = cable;
                    this.hoverCable.setStyle(cableHoverStyle);
                }
            } else {
                if(this.hoverCable !== undefined) {
                    this.hoverCable.setStyle(cableStyle);
                }
                this.hoverCable = cable;
                this.hoverCable.setStyle(cableHoverStyle);
            }
        }

        public mounted() {
            this.select(NullSelection);

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
                if(entity.latitude !== undefined && entity.longitude !== undefined) {
                    const icon = (entity.type === EntityType.SUBSTATION)? iconSubs : iconCabinet;
                    const marker = new EntityMarker([entity.latitude, entity.longitude], entity, {icon});
                    marker.addTo(map);
                    marker.on("click", (event: L.LeafletMouseEvent) => {
                        const marker = event.target as EntityMarker;
                        this.selectIcon(marker);
                        this.select(new Selection(marker.entity.id, ElmtType.Entity, marker.entity.name));
                    });
                    marker.on("mouseover", (event: L.LeafletMouseEvent) => {
                        const marker = event.target as EntityMarker;
                        this.onHoverIcon(marker);
                    });
                    marker.on("mouseout", (event: L.LeafletMouseEvent) => {
                        this.quitHover();
                    });
                    marker.bindTooltip(entity.name + " (" + entity.type + ")");


                    const paraCables = new Map<number, Array<Cable>>();
                    entity.fuses.forEach((fuse: Fuse) => {
                        if(fuse.latitude !== undefined && fuse.longitude !== undefined) {
                            const cable = fuse.cable;
                            const gpsId = (cable.fuse1.latitude as number) - (cable.fuse2.latitude as number);
                            if(paraCables.has(gpsId)) {
                                const array = paraCables.get(gpsId) as Array<Cable>;
                                array.push(cable);
                            } else {
                                paraCables.set(gpsId, [cable]);
                            }
                        }
                    });

                    // Here the algo. does not keep same distance between cables
                    // but the result is sufficient enough for the demo
                    paraCables.forEach((paraC: Array<Cable>) => {
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

                                    const cableLine = new CableLine(geoLine, cable, {color: 'black'});
                                    cableLine.addTo(map);
                                    console.log("added");
                                    cableLine.bindTooltip(cable.name);
                                    cableLine.on('click', (event: L.LeafletMouseEvent) => {
                                        const c = event.target as CableLine;
                                        this.selectCable(c);
                                        this.select(new Selection(c.cable.id, ElmtType.Cable))
                                    });

                                    cableLine.on("mouseover", (event: L.LeafletMouseEvent) => {
                                        this.onHoverCable(event.target as CableLine);
                                    });

                                    cableLine.on("mouseout", (event: L.LeafletMouseEvent) => {
                                        this.quitHoverCable();
                                    });

                                }
                            })
                    });

                }
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