<template lang="pug">
  div
    button.btn.btn-primary(v-on:click="approximateLoadNaive") Approximate Uncertain Load (Naive)
    button.btn.btn-primary(v-on:click="approximateLoadBsRule") Approximate Uncertain Load (with rules)
</template>

<script lang="ts">
    import {Vue, Component} from "vue-property-decorator";
    import {ApproximationType, LoadApproxMsg} from "@/plugin/action/loadApprox/load-approx-msg";
    import * as WS from "@/ts/ws";
    import toJson from "@/ts/utils/grid-state-utils";
    import GridState from "@/store/modules/grid-state";


    @Component
    export default class ULoadApproxVue extends Vue {

      public approximateLoadNaive() {
        this.approximateLoad("naive")
      }

      public approximateLoadBsRule() {
        this.approximateLoad("bs_rule")
      }

      public approximateLoad(type: ApproximationType) {
        const info: LoadApproxMsg = {
          type: "ULoadApproximation",
          approximationType: type,
          grid: toJson((this.$store as any)._modulesNamespaceMap["GridState/"].state as GridState)
        }

        WS.sendMessage(info);
      }
    }
</script>

<style scoped lang="scss">
  button {
    margin-bottom: 5px;
    margin-top: 5px;
  }
</style>