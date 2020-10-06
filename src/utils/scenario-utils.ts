import {GridData} from "@/utils/grid-utils";
import {Cable, ConfidenceLevel, Entity, EntityType, Fuse, Grid, Meter, State, ULoad} from "@/ts/grid";
import {getScNbFuses, Scenario} from "@/ts/scenario";


function createFuses(nbFuses: number, data: GridData) {
    for(let i = 0; i < nbFuses; i++) {
        const fuseId = i + "";
        data.fuseIdx.set(fuseId, i);
        data.fusesStates.push({state: State.CLOSED, fuseId})
        data.fusesConf.push({conf: new ConfidenceLevel(), fuseId});
        data.fusesULoads.push({load: [], fuseId});
        data.staticInfo.fuses.set(fuseId, new Fuse(fuseId));
    }
}

function createCables(nbCables: number, data: GridData) {
    for (let i = 0; i < nbCables; i++) {
        const cableId = i + "";
        data.cableIdx.set(cableId, i);
        data.cablesULoads.push({load: [], cableId});
        data.meterIdx.set(cableId, i);
        data.metersCons.push({cons: 0, meterId: cableId});

        const f1 = data.staticInfo.fuses.get((i * 2) + "") as Fuse;
        const f2 = data.staticInfo.fuses.get(((i * 2) + 1) + "") as Fuse;
        const cable = new Cable(cableId, f1, f2);
        data.staticInfo.cables.set(cableId, cable);

        const meter = new Meter(cableId, "Meter " + cableId, cable);
        data.staticInfo.meters.set(cableId, meter);
    }
}

function initGridData(scenario: Scenario): GridData {
    const data: GridData =  {
        staticInfo: new Grid(new Map<string, Cable>(), new Map<string, Fuse>(), new Map<string, Meter>(), new Map<string, Entity>()),

        meterIdx: new Map<string, number>(),
        fuseIdx: new Map<string, number>(),
        cableIdx: new Map<string, number>(),

        metersCons: new Array<{cons: number; meterId: string }>(),
        fusesStates: new Array<{state: State; fuseId: string}>(),
        fusesConf: new Array<{conf: ConfidenceLevel; fuseId: string}>(),
        fusesULoads: new Array<{load: Array<ULoad>; fuseId: string}>(),
        cablesULoads: new Array<{load: Array<ULoad>; cableId: string}>(),
    };

    const nbFuses = getScNbFuses(scenario);
    createFuses(nbFuses, data);
    createCables(nbFuses / 2, data)

    return data;
}

export function createSingleCableSc(): GridData {
    const gridData = initGridData(Scenario.SINGLE_CABLE);

    const f1 = gridData.staticInfo.fuses.get("0") as Fuse;
    const f2 = gridData.staticInfo.fuses.get("1") as Fuse;
    const substation = new Entity("0", EntityType.SUBSTATION, "Substation", [f1]);
    const cabinet = new Entity("1", EntityType.CABINET,"Cabinet", [f2]);
    gridData.staticInfo.entities?.set("0", substation);
    gridData.staticInfo.entities?.set("1", cabinet);

    return gridData;
}


export function createCabinetSc(): GridData {
    const gridData = initGridData(Scenario.CABINET);

    const f1 = gridData.staticInfo.fuses.get("0") as Fuse;
    const f2 = gridData.staticInfo.fuses.get("1") as Fuse;
    const f3 = gridData.staticInfo.fuses.get("2") as Fuse;
    const f4 = gridData.staticInfo.fuses.get("3") as Fuse;
    const f5 = gridData.staticInfo.fuses.get("4") as Fuse;
    const f6 = gridData.staticInfo.fuses.get("5") as Fuse;


    const substation = new Entity("0", EntityType.SUBSTATION, "Substation", [f1]);
    const cabinet = new Entity("1", EntityType.CABINET,"Cabinet", [f2, f3, f4]);
    const deadend1 = new Entity("2", EntityType.CABINET,"Dead-End Cabinet 1", [f5]);
    const deadend2 = new Entity("3", EntityType.CABINET,"Dead-End Cabinet 2", [f6]);

    gridData.staticInfo.entities?.set("0", substation);
    gridData.staticInfo.entities?.set("1", cabinet);
    gridData.staticInfo.entities?.set("2", deadend1);
    gridData.staticInfo.entities?.set("3", deadend2);

    return gridData;
}

export function createParaSubs(): GridData {
    const gridData = initGridData(Scenario.PARA_SUBS);

    const f0 = gridData.staticInfo.fuses.get("0") as Fuse;
    const f1 = gridData.staticInfo.fuses.get("1") as Fuse;
    const f2 = gridData.staticInfo.fuses.get("2") as Fuse;
    const f3 = gridData.staticInfo.fuses.get("3") as Fuse;
    const f4 = gridData.staticInfo.fuses.get("4") as Fuse;
    const f5 = gridData.staticInfo.fuses.get("5") as Fuse;

    gridData.staticInfo
        .entities
        .set("0", new Entity("0", EntityType.SUBSTATION, "Substation", [f0, f2]));
    gridData.staticInfo
        .entities
        .set("1", new Entity("1", EntityType.CABINET, "Cabinet 1", [f1, f3, f4]));
    gridData.staticInfo
        .entities
        .set("2", new Entity("2", EntityType.CABINET, "Cabinet 2", [f5]));

    return gridData;
}

export function createParaCab(): GridData {
    const gridData = initGridData(Scenario.PARA_CABINET);

    const f0 = gridData.staticInfo.fuses.get("0") as Fuse;
    const f1 = gridData.staticInfo.fuses.get("1") as Fuse;
    const f2 = gridData.staticInfo.fuses.get("2") as Fuse;
    const f3 = gridData.staticInfo.fuses.get("3") as Fuse;
    const f4 = gridData.staticInfo.fuses.get("4") as Fuse;
    const f5 = gridData.staticInfo.fuses.get("5") as Fuse;
    const f6 = gridData.staticInfo.fuses.get("6") as Fuse;
    const f7 = gridData.staticInfo.fuses.get("7") as Fuse;

    gridData.staticInfo
        .entities
        .set("0", new Entity("0", EntityType.SUBSTATION, "Substation", [f0]));
    gridData.staticInfo
        .entities
        .set("1", new Entity("1", EntityType.CABINET, "Cabinet 1", [f1, f2, f4]));
    gridData.staticInfo
        .entities
        .set("2", new Entity("2", EntityType.CABINET, "Cabinet 2", [f3, f5, f6]));
    gridData.staticInfo
        .entities
        .set("3", new Entity("3", EntityType.CABINET, "Cabinet 3", [f7]));

    return gridData;
}

export function createIndirectPara(): GridData {
    const gridData = initGridData(Scenario.INDIRECT_PARA);

    const f0 = gridData.staticInfo.fuses.get("0") as Fuse;
    const f1 = gridData.staticInfo.fuses.get("1") as Fuse;
    const f2 = gridData.staticInfo.fuses.get("2") as Fuse;
    const f3 = gridData.staticInfo.fuses.get("3") as Fuse;
    const f4 = gridData.staticInfo.fuses.get("4") as Fuse;
    const f5 = gridData.staticInfo.fuses.get("5") as Fuse;
    const f6 = gridData.staticInfo.fuses.get("6") as Fuse;
    const f7 = gridData.staticInfo.fuses.get("7") as Fuse;
    const f8 = gridData.staticInfo.fuses.get("8") as Fuse;
    const f9 = gridData.staticInfo.fuses.get("9") as Fuse;

    gridData.staticInfo
        .entities
        .set("0", new Entity("0", EntityType.SUBSTATION, "Substation", [f0, f2]));
    gridData.staticInfo
        .entities
        .set("1", new Entity("1", EntityType.CABINET, "Cabinet 1", [f1, f7, f8]));
    gridData.staticInfo
        .entities
        .set("2", new Entity("2", EntityType.CABINET, "Cabinet 2", [f3, f6, f4]));
    gridData.staticInfo.entities.set("3", new Entity("3", EntityType.CABINET, "Cabinet 3", [f5]));
    gridData.staticInfo.entities.set("4", new Entity("4", EntityType.CABINET, "Cabinet 4", [f9]));

    return gridData;
}