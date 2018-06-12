// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Resource from 'vue-resource'
Vue.use(Resource)

import {currency} from './util/currency'
Vue.filter('currency',currency)

import axios from 'axios'
Vue.prototype.$axios = axios;

import VueLazyLoad from 'vue-lazyload'
Vue.use(VueLazyLoad,{
	loading:'/static/loading-svg/loading-balls.svg'
})

import VueInfiniteScroll from 'vue-infinite-scroll'
Vue.use(VueInfiniteScroll)

import Vuex from 'vuex'
Vue.use(Vuex);

const store = new Vuex.Store({
	state:{
		cartCount:0
	},
	mutations:{
		updataCartCount(state,cartCount){
			state.cartCount += cartCount;
		},
		initCartCount(state,cartCount){
			state.cartCount = cartCount;
		}
	}
})
 
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
})
