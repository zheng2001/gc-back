import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import '@/assets/css/global.css'
import VueCropper from 'vue-cropper'
import SlideVerify from 'vue-monoplasty-slide-verify';


Vue.config.productionTip = false
Vue.use(ElementUI,{size:'small'});
Vue.use(VueCropper)
Vue.use(SlideVerify);


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
