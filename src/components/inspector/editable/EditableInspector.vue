<template lang="pug">
  div
    h2(contenteditable="true" @input="setName($event)") {{name}}
    h3 {{selectedElement.type}} - {{selectedElement.id}}
    .form
      CableInsp(v-if="isCable")
      ListFuses(v-else)

    .closingButton(v-on:click="reset()")
      svg
        use(xlink:href="#close-button")
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {namespace} from "vuex-class";
import {Cable, Entity, Grid} from "@/ts/grid";
import {ElmtType, Selection} from "@/utils/selection";
import ListFuses from "@/components/inspector/ListFuses.vue";
import CableInsp from "@/components/inspector/CableInsp.vue";

const gridState = namespace('GridState')
  const inspectorState = namespace('InspectorState');

  @Component({
    components: {CableInsp, ListFuses}
  })
  export default class EditableInspector extends Vue {
    @gridState.State
    public grid!: Grid;

    @inspectorState.State
    public selectedElement!: Selection;

    @inspectorState.Mutation
    public reset!: () => void;

    public get name(): string {
      if(this.selectedElement.type === ElmtType.Entity) {
        return ((this.grid.entities as Map<number, Entity>)
          .get(this.selectedElement.id as number) as Entity).name
      } else {
        return (this.grid.cables.get(this.selectedElement.id) as Cable).name
      }

    }

    public setName(event: InputEvent) {
      const newName = (event.target as HTMLElement).innerText;
      if(this.selectedElement.type === ElmtType.Entity) {
        ((this.grid.entities as Map<number, Entity>)
            .get(this.selectedElement.id as number) as Entity).name = newName;
      } else {
        (this.grid.cables.get(this.selectedElement.id) as Cable).name = newName
      }

    }

    get isCable(): boolean {
      return this.selectedElement.type === ElmtType.Cable;
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