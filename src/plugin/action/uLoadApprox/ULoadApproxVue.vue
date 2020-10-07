<template lang="pug">
  button.btn.btn-primary(v-on:click="approximateLoad") Approximate Uncertain Load
</template>

<script lang="ts">
    import {Vue, Component} from "vue-property-decorator";
    import {LoadApproxMsg} from "@/plugin/action/loadApprox/load-approx-msg";
    import * as WS from "@/ws";
    import toJson from "@/utils/grid-state-utils";
    import GridState from "@/store/modules/grid-state";


    @Component
    export default class ULoadApproxVue extends Vue {

      public approximateLoad() {
        const info: LoadApproxMsg = {
          type: "ULoadApproximation",
          grid: toJson((this.$store as any)._modulesNamespaceMap["GridState/"].state as GridState)
        }

        WS.sendMessage(info);
      }
    }
</script>

<style scoped>

</style>