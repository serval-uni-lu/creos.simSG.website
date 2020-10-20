<template lang="pug">
  div
    h2(contenteditable="true" @input="setName($event)") {{name}}
    h3 {{selectedElement.type}} - {{selectedElement.id}}
    .form
      CableInsp(v-if="isCable")
      ListFuses(v-else-if="isEntity")
      MeterInsp(v-else-if="isMeter")

    .closingButton(v-on:click="reset()")
      svg
        use(xlink:href="#close-button")
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {namespace} from "vuex-class";
import {Cable, Entity, Grid, Meter} from "@/ts/grid";
import {ElmtType, Selection} from "@/ts/utils/selection";
import ListFuses from "@/pages/components/inspector/ListFuses.vue";
import CableInsp from "@/pages/components/inspector/CableInsp.vue";
import MeterInsp from "@/pages/components/inspector/MeterInsp.vue";

const gridState = namespace('GridState')
  const inspectorState = namespace('InspectorState');

  @Component({
    components: {MeterInsp, CableInsp, ListFuses}
  })
  export default class EditableInspector extends Vue {
    @gridState.State
    public grid!: Grid;

    @inspectorState.State
    public selectedElement!: Selection;

    @inspectorState.Mutation
    public reset!: () => void;

    public get name(): string {
      if(this.isEntity) {
        return ((this.grid.entities as Map<string, Entity>)
          .get(this.selectedElement.id) as Entity).name
      } else if (this.isCable) {
        return (this.grid.cables.get(this.selectedElement.id) as Cable).name
      } else if(this.isMeter) {
        return (this.grid.meters.get(this.selectedElement.id) as Meter).name
      }

      return "ERROR"; //should not be executed

    }

    public setName(event: InputEvent) {
      const newName = (event.target as HTMLElement).innerText;
      if(this.isEntity) {
        ((this.grid.entities as Map<string, Entity>)
            .get(this.selectedElement.id) as Entity).name = newName;
      } else if(this.isCable) {
        (this.grid.cables.get(this.selectedElement.id) as Cable).name = newName;
      } else if(this.isMeter) {
        (this.grid.meters.get(this.selectedElement.id) as Meter).name = newName;
      } else {
        console.log("Silent error: setName");
      }

    }

    get isCable(): boolean {
      return this.selectedElement.type === ElmtType.Cable;
    }

    get isEntity(): boolean {
      return this.selectedElement.type === ElmtType.Entity;
    }

    get isMeter(): boolean {
      return this.selectedElement.type === ElmtType.Meter
    }

  }
</script>

<style scoped lang="scss">
  @import "@/scss/global-var.scss";

  h2 {
    margin-bottom: 0;
  }

  h3 {
    margin-top: 0;
  }

  .form {
    font-size: $inspector-font-size;
    text-align: left;
    padding-left: 10px;
    flex: 1 1 auto;
    overflow-y: auto;
    height: 0px;
  }

  .closingButton {
    position: absolute;
    top: 5px;
    right: 5px;

    svg {
      width: 20px;
      height: 20px;
      stroke: black;
      stroke-width: 2;

      &:hover {
        stroke: lightcoral;
      }

    }
  }
</style>