import Vuex from "vuex";

import notifications, {
  MODULE_NOTIFICATIONS,
  MUTATION_REMOVE_NOTIFICATION,
  showNotification,
  showInfo,
  showSuccess,
  showWarning,
  showError
} from "./notifications";
import threads, {
  MODULE_THREADS,
  ACTION_GET_THREADS,
  ACTION_GET_MESSAGES,
  ACTION_CREATE_THREAD
} from "./threads";
import user, { MODULE_USER, MUTATION_SET_USER } from "./user";

export {
  MODULE_NOTIFICATIONS,
  MUTATION_REMOVE_NOTIFICATION,
  showNotification,
  showInfo,
  showSuccess,
  showWarning,
  showError,
  MODULE_THREADS,
  ACTION_GET_THREADS,
  ACTION_GET_MESSAGES,
  ACTION_CREATE_THREAD,
  MODULE_USER,
  MUTATION_SET_USER
};

export default new Vuex.Store({
  modules: {
    [MODULE_NOTIFICATIONS]: notifications,
    [MODULE_THREADS]: threads,
    [MODULE_USER]: user
  }
});
