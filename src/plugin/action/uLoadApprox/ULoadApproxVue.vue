<template lang="pug">
  button.btn.btn-primary(v-on:click="approximateLoad") Approximate Uncertain Load
</template>

<script lang="ts">
    import {Vue, Component} from "vue-property-decorator";
    import {GridJson} from "@/types/sg-json.types";
    import {LoadApproxMsg} from "@/plugin/action/loadApprox/load-approx-msg";
    import * as WS from "@/ws";
    import {namespace} from "vuex-class";

    const gridState = namespace("GridState");

    @Component
    export default class ULoadApproxVue extends Vue {
      @gridState.Getter
      public gridJson!: GridJson;


      public approximateLoad() {
        const info: LoadApproxMsg = {
          type: "ULoadApproximation",
          grid: this.gridJson
        }

        WS.sendMessage(info);
      }
    }
</script>

<style scoped>

</style>