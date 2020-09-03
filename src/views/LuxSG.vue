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
    import {Component, Vue} from "vue-property-decorator";
    import Action from "@/components/Action.vue";
    import Inspector from "@/components/inspector/Inspector.vue";
    import {namespace} from "vuex-class";
    import {ElmtType, NullSelection, Selection} from "@/utils/selection";
    import L from "leaflet";
    import {Entity, EntityType, Grid} from "@/ts/grid";
    import {GridJson} from "@/types/sg-json.types";
    import json from "@/assets/grids/real-case.json";

    const inspectorState = namespace('InspectorState');
    const gridState = namespace("GridState");

    const logoSize = 25;
    const iconSubs = L.icon({
        iconUrl: require("@/assets/logos/grids/substation.png"),
        iconSize: [logoSize, logoSize]
    });

    const iconCabinet = L.icon({
        iconUrl: require("@/assets/logos/grids/cabinet.png"),
        iconSize: [logoSize, logoSize]
    });

    class EntityMarker extends L.Marker {
        id: number;
        name: string;

        constructor(latLng: L.LatLngExpression, id: number, name: string, options?: L.MarkerOptions) {
            super(latLng, options);
            this.id = id;
            this.name = name;
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

        public created() {
            this.initFromJson(json as GridJson);
            // this.select(new Selection(0, ElmtType.Entity))
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

            this.grid.entities?.forEach((entity: Entity) => {
                if(entity.latitude !== undefined && entity.longitude !== undefined) {
                    const icon = (entity.type === EntityType.SUBSTATION)? iconSubs : iconCabinet;
                    // L.marker([entity.latitude, entity.longitude], {icon})
                    //     .addTo(map);
                    const marker = new EntityMarker([entity.latitude, entity.longitude], entity.id, entity.name, {icon});
                    marker.addTo(map);
                    marker.on("click", (event: L.LeafletMouseEvent) => {
                        this.select(new Selection(event.target.id, ElmtType.Entity, event.target.name));
                    })
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