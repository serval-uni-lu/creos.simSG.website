import L, {LatLngExpression, PolylineOptions} from "leaflet";
import {Cable, Entity} from "@/ts/grid";

export class EntityMarker extends L.Marker {
    entity: Entity;

    constructor(latLng: L.LatLngExpression, entity: Entity, options?: L.MarkerOptions) {
        super(latLng, options);
        this.entity = entity;
    }

}

export class CableLine extends L.Polyline {
    cable: Cable;

    constructor(latlngs: LatLngExpression[] | LatLngExpression[][], cable: Cable, options?: PolylineOptions) {
        super(latlngs, options);
        this.cable = cable;
    }
}