import L, {PathOptions} from "leaflet";
import {CableLine, EntityMarker, MeterMarker} from "@/types/sg-markers-types";
import {Cable, Entity, EntityType, Fuse} from "@/ts/grid";

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

const iconMeter = L.icon({
    iconUrl: require("@/assets/logos/grids/meter.svg"),
    iconSize: [logoSize / 2, logoSize / 2]
});

const iconMeterHover = L.icon({
    iconUrl: require("@/assets/logos/grids/meter.svg"),
    iconSize: [logoSizeSelected / 2, logoSizeSelected / 2]
});

const iconMeterSelected = L.icon({
    iconUrl: require("@/assets/logos/grids/meter-selected.svg"),
    iconSize: [logoSizeSelected / 2, logoSizeSelected / 2]
})

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

const meterCableStyle: PathOptions = {
    color: "black",
    weight: 1,
    dashArray: "4"
}

function setDefaultStyle(elmt: CableLine | EntityMarker | MeterMarker) {
    if(elmt instanceof CableLine) {
        elmt.setStyle(cableStyle);
    } else if(elmt instanceof EntityMarker) {
        const newIcon = (elmt.entity.type === EntityType.SUBSTATION) ? iconSubs : iconCabinet;
        elmt.setIcon(newIcon);
    } else {
        elmt.setIcon(iconMeter);
    }
}

function setHoverStyle(elmt: CableLine | EntityMarker | MeterMarker) {
    if(elmt instanceof CableLine) {
        elmt.setStyle(cableHoverStyle);
    } else if(elmt instanceof EntityMarker) {
        const newIcon = (elmt.entity.type === EntityType.SUBSTATION) ? iconSubsHover : iconCabinetHover;
        elmt.setIcon(newIcon);
    } else {
        elmt.setIcon(iconMeterHover);
    }
}

function setSelectedStyle(elmt: CableLine | EntityMarker | MeterMarker) {
    if(elmt instanceof CableLine) {
        elmt.setStyle(cableSelectedStyle);
    } else if(elmt instanceof EntityMarker) {
        const newIcon = (elmt.entity.type === EntityType.SUBSTATION) ? iconSubsSelected : iconCabinetSelected;
        elmt.setIcon(newIcon);
    } else {
        elmt.setIcon(iconMeterSelected)
    }
}

function extractParaCables(entity: Entity): Map<number, Array<Cable>> {
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
    return paraCables;
}

export {setDefaultStyle, setSelectedStyle, setHoverStyle, extractParaCables, meterCableStyle}