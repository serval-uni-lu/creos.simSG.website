<template lang="pug">
    section
        h2 Real-case scenario: Reckange disctrict (Mersch, Luxembourg)

        .container
            Action#action
            #lg-map

</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import L, {LatLngLiteral, TileLayer} from 'leaflet';
    import Action from "@/components/Action.vue";
    import json from "@/assets/grids/real-case.json";
    import {namespace} from "vuex-class";
    import {Cable, Entity, GridJson, Location} from "@/utils/sg-json.types";
    import {EntityType} from "@/utils/grid";

    const gridSCState = namespace('GridState');

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

        // Build a map: fuseId -> Entity
        const mapOwner = new Map<number, Entity>();
        grid.entities.forEach((ent: Entity) => {
           ent.fuses.forEach((fuseId: number) => {
               mapOwner.set(fuseId, ent);
           })
        });

        // Build a map: [Entity, Entity] -> [Path, number]
        const paths = new Map<string, [Path, number]>();
        grid.cables.forEach((cable: Cable) => {
            const owner1 = mapOwner.get(cable.fuses[0]) as Entity;
            const owner2 = mapOwner.get(cable.fuses[1]) as Entity;

            if(owner1.location !== undefined && owner2.location !== undefined) {
                const key = mapPathKey(owner1, owner2);
                if(paths.has(key)) {
                    (paths.get(key) as [Path, number])[1]++;
                } else {
                    paths.set(key, [{point1: owner1.location, point2: owner2.location}, 1]);
                }
            }
        });

        //from the map, create the final array
        const res = Array<Path>();
        paths.forEach((path: [Path, number]) => {
            if(path[1] === 1) {
                res.push(path[0])
            } else {
                const middle = Math.floor(path[1] / 2);
                for(let id=0; id<middle; id++) {
                    const newP: Path = {
                        point1: {...path[0].point1},
                        point2: {...path[0].point2}
                    };
                    const offset = (id + 1) * epsilon;
                    newP.point1.lat += offset;
                    newP.point2.lat += offset;
                    res.push(newP);
                }

                for(let id=middle; id<path[1]; id++) {
                    const newP: Path = {
                        point1: {...path[0].point1},
                        point2: {...path[0].point2}
                    };
                    const offset = (id - middle + 1) * epsilon;
                    newP.point1.lat -= offset;
                    newP.point2.lat -= offset;
                    res.push(newP);
                }
            }
        });

        // return paths.values();
        return res;
    }


    @Component({
        components: {Action}
    })
    export default class LuxSG extends Vue {
        @gridSCState.State
        public grid!: GridJson;

        @gridSCState.Mutation
        public init!: (json: GridJson) => void;


        public map!: L.Map;
        public tileLayers!: TileLayer;
        public layers!: Array<object>;


        public created() {
            this.init(json as GridJson);
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


            this.grid.entities.forEach((ent: Entity) => {
                if(ent.location !== undefined) {
                    const icon = (ent.type.toLowerCase() === EntityType.CABINET.toLowerCase())? iconCabinet : iconSubs;
                    L.marker([ent.location.lat, ent.location.long], {icon: icon}).addTo(this.map);
                }
            });




            for(const line of getLines(this.grid)) {
                const geoLine: LatLngLiteral[] = [
                    {lat: line.point1.lat, lng: line.point1.long},
                    {lat: line.point2.lat, lng: line.point2.long}
                ];

                L.polyline(geoLine, {
                    color: 'black'
                }).addTo(this.map);
            }

        }

    }
</script>

<style lang="scss" scoped>
    $size-side-elmt: 19%;
    $margin: 1%;
    $remaining: calc(100% - (#{$margin} + #{$size-side-elmt}) * 1);
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

</style>