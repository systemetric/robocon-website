export const MODULE_NOTIFICATIONS = "notifications/";

const _MUTATION_ADD_NOTIFICATION = "ADD_NOTIFICATION";
export const MUTATION_REMOVE_NOTIFICATION = "REMOVE_NOTIFICATION";

export const ACTION_SHOW_NOTIFICATION = "SHOW_NOTIFICATION";

export const LEVEL_INFO = "info";
export const LEVEL_SUCCESS = "success";
export const LEVEL_WARNING = "warning";
export const LEVEL_ERROR = "error";

const MESSAGE_TIMEOUT = 3000;

export default {
  namespaced: true,
  state: {
    notifications: [],
    totalNotificationCount: 0
  },
  mutations: {
    [_MUTATION_ADD_NOTIFICATION](state, notification) {
      state.notifications = [...state.notifications, notification];
      state.totalNotificationCount++;
    },
    [MUTATION_REMOVE_NOTIFICATION](state, notificationId) {
      state.notifications = state.notifications.filter(
        notification => notification.id !== notificationId
      );
    }
  },
  actions: {
    [ACTION_SHOW_NOTIFICATION](
      { state, commit },
      { level = LEVEL_INFO, content }
    ) {
      const id = state.totalNotificationCount;
      commit(_MUTATION_ADD_NOTIFICATION, { id, level, content });
      setTimeout(() => {
        commit(MUTATION_REMOVE_NOTIFICATION, id);
      }, MESSAGE_TIMEOUT);
    }
  }
};
