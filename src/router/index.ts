import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../pages/Home.vue'
import Scenarios from '../pages/Scenarios.vue'

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/scenario',
    name: 'scenario',
    component: Scenarios
  },
  {
    path: '/scenario/:name',
    name: 'scview',
    component: () => import('../pages/SCView.vue'),
    props: true
  },
  {
    path: '/scenario-builder',
    name: 'scenario-builder',
    component: () => import('../pages/SCBuilder.vue')
  },
  {
    path: '/lux-sg',
    name: 'lux-sg',
    component: () => import('../pages/LuxSG.vue')
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router
