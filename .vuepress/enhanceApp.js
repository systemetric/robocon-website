import VueFirestore from "vue-firestore";
import VueMasonry from "vue-masonry-css";
import Vuex from "vuex";

// noinspection JSUnusedGlobalSymbols
export default ({ Vue }) => {
  Vue.use(VueFirestore);
  Vue.use(VueMasonry);
  Vue.use(Vuex);
};
