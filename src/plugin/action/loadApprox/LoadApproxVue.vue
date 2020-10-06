<template lang="pug">
    button.btn.btn-primary(v-on:click="approximateLoad") Approximate Load
</template>

<script lang="ts">
    import {Vue, Component} from "vue-property-decorator";
    import * as WS from "@/ws/index"
    import {LoadApproxMsg} from "@/plugin/action/loadApprox/load-approx-msg";
    import {namespace} from "vuex-class";
    import {GridJson} from "@/types/sg-json.types";

    const gridState = namespace("GridState");

    @Component
    export default class LoadApproxVue extends Vue {
      @gridState.Getter
      public gridJson!: GridJson;


      public approximateLoad() {
        const info: LoadApproxMsg = {
          type: "LoadApproximation",
          grid: this.gridJson
        }

        WS.sendMessage(info);
      }
    }
</script>

<style scoped>

</style>