export const MODULE_NOTIFICATIONS = "notifications";

const _MUTATION_ADD_NOTIFICATION = "ADD_NOTIFICATION";
export const MUTATION_REMOVE_NOTIFICATION = "REMOVE_NOTIFICATION";

const _ACTION_SHOW_NOTIFICATION = "SHOW_NOTIFICATION";

const MESSAGE_TIMEOUT = 3000;

const LEVEL_INFO = "info";
const LEVEL_SUCCESS = "success";
const LEVEL_WARNING = "warning";
const LEVEL_ERROR = "error";

export const showNotification = level => content => dispatch => err => {
  if (level === LEVEL_ERROR && err) {
    console.error(err);
  }
  return dispatch(
    MODULE_NOTIFICATIONS + "/" + _ACTION_SHOW_NOTIFICATION,
    { level, content },
    {
      root: true
    }
  );
};

export const showInfo = showNotification(LEVEL_INFO);
export const showSuccess = showNotification(LEVEL_SUCCESS);
export const showWarning = showNotification(LEVEL_WARNING);
export const showError = showNotification(LEVEL_ERROR);

export const showUnexpectedErrorNotification = showError(
  "An unexpected error has occurred!"
);

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
    [_ACTION_SHOW_NOTIFICATION](
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
