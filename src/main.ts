import Vue from 'vue'
import App from './pages/App.vue'
import router from './router'
import store from './store'
import {ActionData} from "@/ts/utils/action-utils";
import LoadApprox from "@/plugin/action/loadApprox/LoadApprox";
import ULoadApprox from "@/plugin/action/uLoadApprox/ULoadApprox";
import * as WS from "./ts/ws";

Vue.config.productionTip = false;

Vue.prototype.$actionCmp = Array<ActionData>();
Vue.use(LoadApprox);
Vue.use(ULoadApprox);

const app = new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});

WS.connect(app);


