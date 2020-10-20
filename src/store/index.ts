import Vue from 'vue'
import Vuex from 'vuex'
import ToolBarState from "@/store/modules/toolbar";
import InspectorState from "@/store/modules/inspector";
import GridState from "@/store/modules/grid-state";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {ToolBarState, InspectorState, GridState}
});
