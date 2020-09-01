import {ULoadInfo, uLoadsData} from "@/utils/uLoadsUtils";
import {ULoad} from "@/ts/grid";

const MARGIN_TOP = 5;
const LINE_HEIGHT = 10;

export function getYText(nbLineInTemplate: number, posElmt: number): number {
    return MARGIN_TOP + posElmt*LINE_HEIGHT;
}

export function layerHeight(nbLineInTemplate: number, nbUloads: number) {
    const realNb = nbUloads===0? 1 : nbUloads;
    return getYText(nbLineInTemplate, nbLineInTemplate + realNb);
}

export function uLoadsDataWithY(uloads: Array<ULoad> | undefined, nbLineInTemplate: number): Array<ULoadInfo> {
    const res = uLoadsData(uloads);
    res.forEach((value, index) => {
        value.y = getYText(nbLineInTemplate, nbLineInTemplate + index);
    });
    return res;
}


