<template lang="pug">
   header#page-header
        h1 SimSG: Smart Grid Simulator

        #logos
            img.creos(src="@/assets/logos/creos.png" alt="logo creos")
            img.serval(src="@/assets/logos/serval.svg" alt="logo serval")

</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';

    @Component
    export default class Header extends Vue {}
</script>

<style lang="scss" scoped>
    $logo-height: 100%;
    $position: right;

    #page-header {
        background-color: lightgray;
        display: flex;
        justify-content: center;
        align-items: center;

        h1 {
            margin: 0;
            font-size: 3em;
        }
    }

    #logos {
        position: absolute;
        top: 10px;
        right: 10px;
        float: $position;
        z-index: 2100;
        height: 100px;

        .creos {
            padding-right: 10px;
            padding-left: 5px;
            height: $logo-height;
        }

        .serval {
            height: $logo-height;
        }

    }
</style>