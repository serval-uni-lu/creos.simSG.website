<template lang="pug">
    section.simsg
        Header
        NavigationBar
        router-view
</template>

<script lang="ts">
    import {Component, Vue, Watch} from 'vue-property-decorator';
    import Header from "@/pages/components/Header.vue";
    import NavigationBar from "@/pages/components/NavigationBar.vue";
    import {namespace} from "vuex-class";

    const inspectorState = namespace('InspectorState');

    @Component({
        components: {NavigationBar, Header}
    })
    export default class App extends Vue {
        @inspectorState.Mutation
        public reset!: () => void;

        @Watch('$route')
        public onRouteChanged() {
            this.reset();
        }
    }
</script>

<style lang="scss">
    @import "@/scss/global-var.scss";

    body, html {
        margin: 0;
        height: 100%;
    }

    * {
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
    }

    .simsg {
        height: 100%;
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        color: $text-color;
        display: flex;
        flex-direction: column;
        align-items: center;

        a {
            text-decoration-line: none;
            color: $link-color;
        }

        a.router-link-exact-active, a.router-link-active:not(.home) {
            color: $color-selection;
            font-weight: bold;
        }
    }

    .simsg > header {
        height: 80px;
        width: 100%;
    }

    .simsg > nav {
        height: 40px;
        width: 100%;
    }

    .simsg > section {
        flex: 1;
        width: 100%;
    }

</style>
