import L, {LatLngExpression, PolylineOptions} from "leaflet";
import {Cable, Entity, Meter} from "@/ts/grid";

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

export class CableMarker extends L.Marker {
    cableId: string;

    constructor(latLng: L.LatLngExpression, cableId: string, options?: L.MarkerOptions) {
        super(latLng, options);
        this.cableId = cableId;
    }
}

export class MeterMarker extends L.Marker {
    meter: Meter

    constructor(latLng: L.LatLngExpression, meter: Meter, options?: L.MarkerOptions) {
        super(latLng, options);
        this.meter = meter;
    }
}