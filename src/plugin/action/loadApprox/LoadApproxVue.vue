<template lang="pug">
    button.btn.btn-primary(v-on:click="approximateLoad") Approximate Load
</template>

<script lang="ts">
    import {Vue, Component} from "vue-property-decorator";
    import * as WS from "@/ts/ws/index"
    import {LoadApproxMsg} from "@/plugin/action/loadApprox/load-approx-msg";
    import toJson from "@/ts/utils/grid-state-utils";
    import GridState from "@/store/modules/grid-state";

    @Component
    export default class LoadApproxVue extends Vue {
      public approximateLoad() {
        const info: LoadApproxMsg = {
          type: "LoadApproximation",
          grid: toJson((this.$store as any)._modulesNamespaceMap["GridState/"].state as GridState)
        }

        WS.sendMessage(info);
      }
    }
</script>

<style scoped>

</style>