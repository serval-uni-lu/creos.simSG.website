import {ElmtType} from "@/utils/selection";
import {ElmtType} from "@/utils/selection";
<template>
    <g class="cable" v-bind:class="{selected: isSelected(this.selection)}" v-on:click="eventHandler()">
        <title>Load: {{uLoads()}}</title>
        <title>Load: </title>
        <line :x1=line1.x1 :y1=line1.y1 :x2=line1.x2 :y2=line1.y2 stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
        <line :x1=line2.x1 :y1=line2.y1 :x2=line2.x2 :y2=line2.y2 stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
        <circle :cx=line1.x1 :cy=circle.y r="5"/>
        <circle :cx=circle.x :cy=circle.y r="7" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
    </g>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import {Circle, Line} from "@/utils/SvgTypes"
    import {namespace} from "vuex-class";
    import {ElmtType, Selection} from "@/utils/selection";
    import {Cable} from "@/utils/grid";

    import {useSelectionCompo} from "@/composition/selectionComposition";

    const gridState = namespace('GridSCState');

    @Component({
        setup: useSelectionCompo
    })
    export default class SimpleCable extends Vue{
        @Prop() id!: number;
        @Prop() line1!: Line;
        @Prop() line2!: Line;
        @Prop() circle!: Circle;

        // Defined in useSelectionCompo
        public changeSelection!: (elmt: Selection) => void;
        public selection: Selection = new Selection(this.id, ElmtType.Cable);

        @gridState.State
        public allCables!: Array<Cable>;


        public eventHandler(): void {
            this.changeSelection(this.selection);
        }

        public uLoads(): string {
            const uloads = this.allCables[this.id].uLoads;
            if(uloads.length == 0) {
                return "TBD";
            }

            let result = "{";
            for(let ul=0; ul<uloads.length; ul++) {
                result += "(" + uloads[ul].prettyLoad() + " [" + uloads[ul].prettyConf() + "%]";
                if(ul !== uloads.length - 1) {
                    result += ", ";
                }
            }
            result += "}";

            return result;
        }
    }
</script>

<style scoped lang="scss">
    @import "@/scss/cable.scss";
</style>