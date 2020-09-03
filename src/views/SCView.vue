<template lang="pug">
    section
        h2 {{title}}

        div#viewer
            Action#action
            SCViewer(v-bind:name="name")#scviewer
            Inspector#inspector(v-if="inspVisible")


</template>

<script lang="ts">
    import {Component,Vue, Prop} from "vue-property-decorator";
    import scenarios from "@/assets/scenarios/scenarios.json"
    import SCViewer from "@/components/scView/SCViewer.vue";
    import Action from "@/components/Action.vue";
    import Inspector from "@/components/inspector/Inspector.vue";
    import {namespace} from "vuex-class";
    import {NullSelection, Selection} from "@/utils/selection";

    const inspectorState = namespace('InspectorState');

    @Component({
        components: {SCViewer, Action, Inspector}
    })
    export default class SCView extends Vue {
        @Prop() name!: string;

        @inspectorState.State
        public selectedElement!: Selection;

        get inspVisible(): boolean {
            return !this.selectedElement.equals(NullSelection);
        }

        get title(): string {
            for(const sc of scenarios) {
                if(sc.url === this.name) {
                    return sc.title;
                }
            }
            return "Scenario \"" + this.name + "\" does not exist."
        }

    }

</script>

<style lang="scss" scoped>
    @import "@/scss/viewer.scss";

    $remaining: calc(100% - (#{$margin} + #{$size-side-elmt}) * 2);

    #scviewer {
        width: $remaining;
    }
</style>