<template lang="pug">
    section
        h2 Real-case scenario: Reckange disctrict (Mersch, Luxembourg)

        .container
            Action#action
            #lg-map
            Inspector#inspector(v-if="inspVisible")


</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import L, {LatLngExpression, LatLngLiteral, LeafletMouseEvent, PolylineOptions, TileLayer} from 'leaflet';
    import Action from "@/components/Action.vue";
    import json from "@/assets/grids/real-case.json";
    import {namespace} from "vuex-class";
    import {CableJson, EntityJson, GridJson, LocationJson} from "@/types/sg-json.types";
    import Inspector from "@/components/inspector/Inspector.vue";
    import {ElmtType, NullSelection, Selection} from "@/utils/selection";
    import {Entity, Grid} from "@/ts/grid";

    const gridState = namespace('GridState');
    const inspectorState = namespace('InspectorState');


    const logoSize = 25;
    const iconSubs = L.icon({
        iconUrl: require("@/assets/logos/grids/substation.png"),
        iconSize: [logoSize, logoSize]
    });

    const iconCabinet = L.icon({
        iconUrl: require("@/assets/logos/grids/cabinet.png"),
        iconSize: [logoSize, logoSize]
    });

    const epsilon = 0.00005;

    function mapPathKey(e1: Entity, e2: Entity) {
        return e1.name + e2.name;
    }

    type Path =  {
        point1: Location;
        point2: Location;
    }



    function getLines(grid: GridJson): Array<Path> {

        // // Build a map: fuseId -> Entity
        // const mapOwner = new Map<number, Entity>();
        // grid.entities.forEach((ent: Entity) => {
        //    ent.fuses.forEach((fuseId: number) => {
        //        mapOwner.set(fuseId, ent);
        //    })
        // });
        //
        // // Build a map: [Entity, Entity] -> [Path, number]
        // const paths = new Map<string, [Path, number]>();
        // grid.cables.forEach((cable: Cable) => {
        //     const owner1 = mapOwner.get(cable.fuses[0]) as Entity;
        //     const owner2 = mapOwner.get(cable.fuses[1]) as Entity;
        //
        //     if(owner1.location !== undefined && owner2.location !== undefined) {
        //         const key = mapPathKey(owner1, owner2);
        //         if(paths.has(key)) {
        //             (paths.get(key) as [Path, number])[1]++;
        //         } else {
        //             paths.set(key, [{point1: owner1.location, point2: owner2.location}, 1]);
        //         }
        //     }
        // });
        //
        // //from the map, create the final array
        // const res = Array<Path>();
        // paths.forEach((path: [Path, number]) => {
        //     if(path[1] === 1) {
        //         res.push(path[0])
        //     } else {
        //         const middle = Math.floor(path[1] / 2);
        //         for(let id=0; id<middle; id++) {
        //             const newP: Path = {
        //                 point1: {...path[0].point1},
        //                 point2: {...path[0].point2}
        //             };
        //             const offset = (id + 1) * epsilon;
        //             newP.point1.lat += offset;
        //             newP.point2.lat += offset;
        //             res.push(newP);
        //         }
        //
        //         for(let id=middle; id<path[1]; id++) {
        //             const newP: Path = {
        //                 point1: {...path[0].point1},
        //                 point2: {...path[0].point2}
        //             };
        //             const offset = (id - middle + 1) * epsilon;
        //             newP.point1.lat -= offset;
        //             newP.point2.lat -= offset;
        //             res.push(newP);
        //         }
        //     }
        // });
        //
        // return res;
        return [];
    }

    class DataMarker extends L.Marker {
        data: any;

        constructor(latLng: L.LatLngExpression, data: any, options?: L.MarkerOptions) {
            super(latLng, options);
            this.setData(data);
        }

        getData() {
            return this.data;
        }

        setData(data: any) {
            this.data = data;
        }
    }

    class DataPolyLine extends L.Polyline {
        data: any;

        constructor(latlngs: LatLngExpression[] | LatLngExpression[][], data: any, options?: PolylineOptions) {
            super(latlngs, options);
            this.data = data;
        }
    }


    @Component({
        components: {Inspector, Action}
    })
    export default class LuxSG extends Vue {
        @gridState.State
        public grid!: Grid;

        @gridState.Mutation
        public init!: (json: GridJson) => void;

        @inspectorState.State
        public selectedElement!: Selection;

        @inspectorState.Mutation
        public select!: (elmt: Selection) => void;

        public map!: L.Map;
        public tileLayers!: TileLayer;
        public layers!: Array<object>;

        get inspVisible(): boolean {
            return !this.selectedElement.equals(NullSelection);
        }


        public created() {
            this.init(json as GridJson);
        }

        public handleEvenOnMap(e: LeafletMouseEvent) {
            this.select(new Selection(0, ElmtType.Fuse));
            console.log(e.target.data)
        }

        public mounted() {
            this.map = L.map("lg-map", {
                center: [49.749219791749525, 6.08051569442007],
                zoom: 16,
                zoomControl: false
            });

            this.tileLayers = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            });
            this.tileLayers.addTo(this.map);


            // this.grid.entities.forEach((ent: Entity) => {
            //     if(ent.location !== undefined) {
            //         const icon = (ent.type.toLowerCase() === EntityType.CABINET.toLowerCase())? iconCabinet : iconSubs;
            //         // L.marker([ent.location.lat, ent.location.long], {icon: icon}).addTo(this.map);
            //
            //         const marker = new DataMarker([ent.location.lat, ent.location.long], "YouPi!", {
            //             icon: icon
            //         });
            //         marker.addTo(this.map);
            //         marker.on("click", event => {
            //             console.log(event.target);
            //         });
            //     }
            // });

            // this.map.on("click", this.handleEvenOnMap);

            // for(const line of getLines(this.grid)) {
            //     const geoLine: LatLngLiteral[] = [
            //         {lat: line.point1.lat, lng: line.point1.long},
            //         {lat: line.point2.lat, lng: line.point2.long}
            //     ];
            //
            //     // L.polyline(geoLine, {
            //     //     color: 'black'
            //     // }).addTo(this.map);
            //     const l = new DataPolyLine(geoLine, "Oh oui!", {
            //         color: 'black'
            //     });
            //     l.addTo(this.map);
            //     l.on('click', event => {
            //         console.log(event.target)
            //     })
            // }

        }

    }
</script>

<style lang="scss" scoped>
    $size-side-elmt: 19%;
    $margin: 1%;
    $remaining: calc(100% - (#{$margin} + #{$size-side-elmt}) * 2);
    $color: lightgrey;

    section {
        text-align: center;
        display: flex;
        flex-direction: column;
    }

    .container {
        flex: 1;
        display: flex;
        flex-direction: row;
    }


    #action {
        width: $size-side-elmt;
        margin-left: $margin;
        margin-bottom: $margin;
        background-color: $color;
    }

    #lg-map {
        width: $remaining;
        margin: 0 $margin $margin;
    }

    #inspector {
        width: $size-side-elmt;
        box-shadow: 10px 10px 16px darkgray;
        background-color: $color;
        margin-bottom: $margin;
        margin-right: $margin;
        position: relative;
    }

</style>