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
    import L, {DomEvent, LatLngLiteral, LeafletEventHandlerFn} from "leaflet";
    import {Cable, Entity, EntityType, Fuse, Grid} from "@/ts/grid";
    import {GridJson} from "@/types/sg-json.types";
    import json from "@/assets/grids/real-case.json";
    import off = DomEvent.off;

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

    class EntityMarker extends L.Marker {
       entity: Entity;

        constructor(latLng: L.LatLngExpression, entity: Entity, options?: L.MarkerOptions) {
            super(latLng, options);
            this.entity = entity;
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

        public created() {
            this.initFromJson(json as GridJson);
            // this.select(new Selection(0, ElmtType.Entity))
        }


        @Watch("selectedElement")
        public test() {
            if(this.selectedElement.equals(NullSelection) && this.selectedMarker !== undefined) {
                const newIcon = (this.selectedMarker.entity.type === EntityType.SUBSTATION)? iconSubs : iconCabinet;
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
        }

        private quitHover() {
            if (this.hoverMarker !== undefined && this.hoverMarker.entity !== this.selectedMarker?.entity) {
                const newIcon = (this.hoverMarker.entity.type === EntityType.SUBSTATION) ? iconSubs : iconCabinet;
                this.hoverMarker.setIcon(newIcon);
            }
            this.hoverMarker = undefined;
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

            map.on("zoom", (event: L.LeafletEvent) => {
                console.log(event.target._zoom)
            });

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

                    // Todo
                    // Here the algo. computes the offset based on the idx of the fuse
                    // but it should group them per parallels cables first
                    entity.fuses.forEach((fuse: Fuse, idx: number, all: Array<Fuse>) => {
                        if(fuse.latitude !== undefined && fuse.longitude !== undefined) {
                            const cable = fuse.cable;
                            if(!cableDone.has(cable.id)) {
                                cableDone.add(cable.id);
                                let geoLine: LatLngLiteral[];
                                if(all.length == 1) {
                                    geoLine = [
                                        {lat: cable.fuse1.latitude as number, lng: cable.fuse1.longitude as number},
                                        {lat: cable.fuse2.latitude as number, lng: cable.fuse2.longitude as number},
                                    ]
                                } else {
                                    let offset: number;
                                    if(idx % 2 === 0) {
                                        offset = (idx/2 + 1);
                                    } else {
                                        offset = -((idx+1)/2);
                                    }
                                    offset = offset * 0.00002;
                                    geoLine = [
                                        {lat: (cable.fuse1.latitude as number) + offset, lng: (cable.fuse1.longitude as number) + offset},
                                        {lat: (cable.fuse2.latitude as number) + offset, lng: (cable.fuse2.longitude as number) + offset}
                                    ]
                                }

                                const a = L.polyline(geoLine, {color: 'black'});
                                a.addTo(map);
                            }
                        }

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