import VueFirestore from "vue-firestore";
import VueMasonry from "vue-masonry-css";

// noinspection JSUnusedGlobalSymbols
export default ({ Vue }) => {
  Vue.use(VueFirestore);
  Vue.use(VueMasonry);
};
