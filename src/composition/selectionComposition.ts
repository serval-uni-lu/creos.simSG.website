import {createNamespacedHelpers} from "vuex-composition-helpers";
import {RefTypes} from "vuex-composition-helpers/dist/types/util";
import InspectorState from "@/store/modules/inspector";
import {Selection} from "@/utils/selection";

export function useSelectionCompo() {
    const {useState, useMutations} = createNamespacedHelpers('InspectorState');

    const {selectedElement}: RefTypes<InspectorState> = useState(['selectedElement']);
    const {select} = useMutations(['select']);

    function isSelected(current: Selection): boolean {
        return current.equals(selectedElement.value);
    }

    function changeSelection(newSelection: Selection) {
        select(newSelection);
    }

    return {isSelected, changeSelection}

}