import { request } from "./api";
import { showSuccess, showUnexpectedErrorNotification } from "./notifications";

export const MODULE_THREADS = "threads";

const _MUTATION_SET_THREADS = "SET_THREADS";
const _MUTATION_SET_MESSAGES = "SET_MESSAGES";
const _MUTATION_ADD_THREAD_WITH_MESSAGES = "ADD_THREAD";
const _MUTATION_EDIT_TITLE = "EDIT_TITLE";
const _MUTATION_DELETE_THREAD = "DELETE_THREAD";

export const ACTION_GET_THREADS = "GET_THREADS";
export const ACTION_GET_MESSAGES = "GET_MESSAGES";
export const ACTION_CREATE_THREAD = "CREATE_THREAD";
export const ACTION_EDIT_TITLE = "EDIT_TITLE";
export const ACTION_DELETE_THREAD = "DELETE_THREAD";

function parseCreatedDates(arr) {
  return arr.map(obj => {
    obj.created = new Date(obj.created);
    return obj;
  });
}

function sortThreads(threads) {
  threads.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.created.getTime() - a.created.getTime();
  });
}

export function canEdit(object, $store) {
  const user = $store.state.user.user;
  const isOwner = user && object.author.id === user.id;
  const isModerator = $store.getters["user/isModerator"];
  return isOwner || isModerator;
}

export function canDelete(object, $store) {
  const isModerator = $store.getters["user/isModerator"];
  return isModerator;
}

const showMessagePostedNotification = showSuccess("Message posted!");
const showTitleSavedNotification = showSuccess("Title saved!");
const showThreadDeletedNotification = showSuccess("Thread deleted!");

export default {
  namespaced: true,
  state: {
    threads: null,
    messages: {}
  },
  mutations: {
    [_MUTATION_SET_THREADS](state, threads) {
      state.threads = threads;
    },
    [_MUTATION_SET_MESSAGES](state, { threadId, messages }) {
      state.messages[threadId] = messages;
    },
    [_MUTATION_ADD_THREAD_WITH_MESSAGES](state, thread) {
      state.messages[thread.id] = thread.messages;
      const threadCopy = { ...thread };
      delete threadCopy.messages;
      if (state.threads !== null) {
        const threads = [...state.threads, threadCopy];
        sortThreads(threads);
        state.threads = threads;
      }
    },
    [_MUTATION_EDIT_TITLE](state, { threadId, newTitle }) {
      state.threads = state.threads.map(thread => {
        if (thread.id === threadId) thread.title = newTitle;
        return thread;
      });
    },
    [_MUTATION_DELETE_THREAD](state, threadId) {
      state.threads = state.threads.filter(thread => thread.id !== threadId);
    }
  },
  actions: {
    [ACTION_GET_THREADS]({ state, dispatch, commit }) {
      if (state.threads === null) {
        return request("GET", "/api/forum/thread/")
          .then(res => res.json())
          .then(parseCreatedDates)
          .then(res => commit(_MUTATION_SET_THREADS, res))
          .catch(showUnexpectedErrorNotification(dispatch));
      }
    },
    [ACTION_GET_MESSAGES]({ state, dispatch, commit }, threadId) {
      if (!state.messages[threadId]) {
        return request(
          "GET",
          `/api/forum/thread/${encodeURIComponent(threadId)}/message/`
        )
          .then(res => res.json())
          .then(parseCreatedDates)
          .then(res =>
            commit(_MUTATION_SET_MESSAGES, { threadId, messages: res })
          )
          .catch(showUnexpectedErrorNotification(dispatch));
      }
    },
    [ACTION_CREATE_THREAD]({ commit, dispatch }, createThreadRequest) {
      return request("POST", "/api/forum/thread/", createThreadRequest)
        .then(res => res.json())
        .then(res => {
          res.created = new Date(res.created);
          res.messages[0].created = new Date(res.messages[0].created);
          return res;
        })
        .then(res => {
          commit(_MUTATION_ADD_THREAD_WITH_MESSAGES, res);
          return showMessagePostedNotification(dispatch)();
        })
        .catch(showUnexpectedErrorNotification(dispatch));
    },
    [ACTION_EDIT_TITLE]({ commit, dispatch }, { thread, newTitle }) {
      commit(_MUTATION_EDIT_TITLE, { threadId: thread.id, newTitle });
      return request(
        "PATCH",
        `/api/forum/thread/${encodeURIComponent(thread.id)}`,
        {
          title: newTitle,
          pinned: thread.pinned
        }
      )
        .then(showTitleSavedNotification(dispatch))
        .catch(showUnexpectedErrorNotification(dispatch));
    },
    [ACTION_DELETE_THREAD]({ commit, dispatch }, threadId) {
      commit(_MUTATION_DELETE_THREAD, threadId);
      return request(
        "DELETE",
        `/api/forum/thread/${encodeURIComponent(threadId)}`
      )
        .then(showThreadDeletedNotification(dispatch))
        .catch(showUnexpectedErrorNotification(dispatch));
    }
  }
};
