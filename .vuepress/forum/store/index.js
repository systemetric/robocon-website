import Vuex from "vuex";

import api from "./api";
import threads, {
  ACTION_GET_THREADS,
  ACTION_GET_MESSAGES,
  ACTION_CREATE_THREAD
} from "./threads";
import user, { MUTATION_SET_USER } from "./user";

export const MODULE_THREADS = "threads/";
export const MODULE_USER = "user/";

export {
  ACTION_GET_THREADS,
  ACTION_GET_MESSAGES,
  ACTION_CREATE_THREAD,
  MUTATION_SET_USER
};

export default new Vuex.Store({
  modules: {
    api,
    threads,
    user
  }
});
