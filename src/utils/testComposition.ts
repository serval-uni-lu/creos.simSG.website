import {createNamespacedHelpers} from "vuex-composition-helpers";


const {useState, useMutations} = createNamespacedHelpers('TestState');

export function myComposition() {
    const {value} = useState([
        'value'
    ]);
    const {double} = useMutations(['double']);

    return {value, double}
}